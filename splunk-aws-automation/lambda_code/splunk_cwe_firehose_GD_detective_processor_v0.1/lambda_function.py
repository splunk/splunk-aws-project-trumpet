"""
This function as a Kinesis pre-processor function will take Guard Duty Findings from CloudWatch Events/EventBridge
and process detective URLs based on the findings.

Cloudwatch Logs sends to Firehose records that look like this:

{
  "messageType": "DATA_MESSAGE",
  "owner": "123456789012",
  "logGroup": "log_group_name",
  "logStream": "log_stream_name",
  "subscriptionFilters": [
    "subscription_filter_name"
  ],
  "logEvents": [
    {
      "id": "01234567890123456789012345678901234567890123456789012345",
      "timestamp": 1510109208016,
      "message": "log message 1"
    },
    {
      "id": "01234567890123456789012345678901234567890123456789012345",
      "timestamp": 1510109208017,
      "message": "log message 2"
    }
    ...
  ]
}

The code below will:

1) Parse the json
2) Send the records in the event to ProcessRecords where the record is base64 decoded and parsed to identify the GuardDuty 
   findings to create detective urls as list fields
3) Any additional records which exceed 6MB will be re-ingested back into Firehose.

"""

import base64
import boto3
import json
import sys
import time
import datetime
from datetime import timedelta

IS_PY3 = sys.version_info[0] == 3

def transformLogEvent(log_event, source):
    """Transform each log event.

    The default implementation below just extracts the message and appends a newline to it.

    Args:
    log_event (dict): The original log event. Structure is {"id": str, "timestamp": long, "message": str}

    Returns:
    str: The transformed log event.
    """
    return_event = {}
    return_event['sourcetype'] = 'aws:cloudwatchlogs'
    return_event['source'] = source
    return_event['event'] = log_event['message']
    return json.dumps(return_event) + '\n'

def find_key_value_pairs(q, keys, dicts=None):
    if not dicts:
        dicts = [q]
        q = [q]  

    data = q.pop(0)
    if isinstance(data, dict):
        data = data.values()

    for d in data:
        dtype = type(d)
        if dtype is dict or dtype is list:
            q.append(d)
            if dtype is dict:
                dicts.append(d)

    if q:
        return find_key_value_pairs(q, keys, dicts)

    return [(k, v) for d in dicts for k, v in d.items() if k in keys]


def processRecords(records):
    for r in records:
        data = json.loads(base64.b64decode(r['data']))
        #print("Data in processRecords")
        #print(data)
        recId = r['recordId']
        return_event = {}
        st = data['source'].replace(".", ":") + ":firehose"
        prefix_url='https://console.aws.amazon.com/detective/home?region='     
        data['detail']['detectiveUrls'] = {}
        
        ## Set ScopeStart and ScopeEnd url parameters
        scopeStartTimestamp = datetime.datetime.strptime(data['detail']['service']['eventFirstSeen'],"%Y-%m-%dT%H:%M:%SZ") 
        scopeEndTimestamp = datetime.datetime.strptime(data['detail']['service']['eventLastSeen'],"%Y-%m-%dT%H:%M:%SZ")                 

        scopeStartTimestamp = scopeStartTimestamp.replace(microsecond=0, second=0, minute=0)
        scopeEndTimestamp = scopeEndTimestamp.replace(microsecond=0, second=0, minute=0) + timedelta(hours=1)

        scopeStart = str((int(scopeStartTimestamp.timestamp())))+'000'
        scopeEnd = str((int(scopeEndTimestamp.timestamp())))+'000'

        #scopeStart = str(int(time.mktime(time.strptime(data['detail']['service']['eventFirstSeen'], "%Y-%m-%dT%H:%M:%SZ"))))
        #scopeEnd = str(int(time.mktime(time.strptime(data['detail']['service']['eventLastSeen'], "%Y-%m-%dT%H:%M:%SZ"))))

        ## Set Guard Duty Findings List to generate Guard Duty findings URL
        guard_duty_findings_list = ['CredentialAccess:IAMUser/AnomalousBehavior','DefenseEvasion:IAMUser/AnomalousBehavior','Discovery:IAMUser/AnomalousBehavior','Exfiltration:IAMUser/AnomalousBehavior'
                                    ,'Impact:IAMUser/AnomalousBehavior','InitialAccess:IAMUser/AnomalousBehavior','PenTest:IAMUser/KaliLinux','PenTest:IAMUser/ParrotLinux','PenTest:IAMUser/PentooLinux'
                                    ,'Persistence:IAMUser/AnomalousBehavior','Persistence:IAMUser/NetworkPermissions','Persistence:IAMUser/ResourcePermissions','Persistence:IAMUser/UserPermissions'
                                    ,'Policy:IAMUser/RootCredentialUsage','PrivilegeEscalation:IAMUser/AdministrativePermissions','PrivilegeEscalation:IAMUser/AnomalousBehavior','Recon:IAMUser/MaliciousIPCaller'
                                    ,'Recon:IAMUser/MaliciousIPCaller.Custom','Recon:IAMUser/NetworkPermissions','Recon:IAMUser/ResourcePermissions','Recon:IAMUser/TorIPCaller','Recon:IAMUser/UserPermissions'
                                    ,'ResourceConsumption:IAMUser/ComputeResources','Stealth:IAMUser/CloudTrailLoggingDisabled','Stealth:IAMUser/LoggingConfigurationModified','Stealth:IAMUser/PasswordPolicyChange'
                                    ,'UnauthorizedAccess:IAMUser/ConsoleLogin','UnauthorizedAccess:IAMUser/ConsoleLoginSuccess.B','UnauthorizedAccess:IAMUser/InstanceCredentialExfiltration','UnauthorizedAccess:IAMUser/MaliciousIPCaller'
                                    ,'UnauthorizedAccess:IAMUser/MaliciousIPCaller.Custom','UnauthorizedAccess:IAMUser/TorIPCaller','Backdoor:EC2/C&CActivity.B','Backdoor:EC2/DenialOfService.Dns'
                                    ,'Backdoor:EC2/DenialOfService.Tcp','Backdoor:EC2/DenialOfService.Udp','Backdoor:EC2/DenialOfService.UdpOnTcpPorts','Backdoor:EC2/DenialOfService.UnusualProtocol'
                                    ,'Backdoor:EC2/Spambot','Behavior:EC2/NetworkPortUnusual','Behavior:EC2/TrafficVolumeUnusual','CryptoCurrency:EC2/BitcoinTool.B','Impact:EC2/PortSweep'
                                    ,'Impact:EC2/WinRMBruteForce','Recon:EC2/PortProbeEMRUnprotectedPort','Recon:EC2/PortProbeUnprotectedPort','Recon:EC2/Portscan','Trojan:EC2/BlackholeTraffic'
                                    ,'Trojan:EC2/DropPoint','UnauthorizedAccess:EC2/MaliciousIPCaller.Custom','UnauthorizedAccess:EC2/RDPBruteForce','UnauthorizedAccess:EC2/SSHBruteForce'
                                    ,'UnauthorizedAccess:EC2/TorClient','UnauthorizedAccess:EC2/TorIPCaller','UnauthorizedAccess:EC2/TorRelay'
                                    ]

        if data['detail']['type'] in guard_duty_findings_list:
            data['detail']['detectiveUrls']['guardDutyFindings'] = prefix_url+data['region']+'#findings/GuardDuty/'+data['detail']['id']+'?scopeStart='+scopeStart+'&scopeEnd='+scopeEnd

        ## Generate IAM User URLs for resourceType Access Keys
        if data['detail']['resource']['resourceType'] == 'AccessKey':
            if data['detail']['resource']['accessKeyDetails']['userType'] == 'AssumedRole':
                data['detail']['detectiveUrls']['awsRoleSession']  = prefix_url+data['region']+'#entities/AwsRoleSession/'+data['detail']['resource']['accessKeyDetails']['principalId']+'?scopeStart='+scopeStart+'&scopeEnd='+scopeEnd
            elif data['detail']['resource']['accessKeyDetails']['userType'] == 'Federated':
                data['detail']['detectiveUrls']['federatedUser']  = prefix_url+data['region']+'#entities/FederatedUser/'+data['detail']['resource']['accessKeyDetails']['principalId']+'?scopeStart='+scopeStart+'&scopeEnd='+scopeEnd
            elif data['detail']['resource']['accessKeyDetails']['userType'] == 'Role':
                data['detail']['detectiveUrls']['awsRole']  = prefix_url+data['region']+'#entities/AwsRole/'+data['detail']['resource']['accessKeyDetails']['principalId']+'?scopeStart='+scopeStart+'&scopeEnd='+scopeEnd
            else:      
                data['detail']['detectiveUrls']['iamUser']  = prefix_url+data['region']+'#entities/AwsUser/'+data['detail']['resource']['accessKeyDetails']['principalId']+'?scopeStart='+scopeStart+'&scopeEnd='+scopeEnd

            ## Get UserAgent url from services if available
            userAgent = find_key_value_pairs(data['detail']['service'], 'fullUserAgent')
            
            index = 0
            if len(userAgent) > 0:
                for k, v in userAgent:
                    if len(userAgent) == 1:
                        data['detail']['detectiveUrls']['userAgent']  = prefix_url+data['region']+'#entities/UserAgent/'+v+'?scopeStart='+scopeStart+'&scopeEnd='+scopeEnd
                    else:
                        data['detail']['detectiveUrls']['userAgent'+str(index + 1)]  = prefix_url+data['region']+'#entities/UserAgent/'+v+'?scopeStart='+scopeStart+'&scopeEnd='+scopeEnd
                    index += 1

        if "accountId" in data['detail']:
            data['detail']['detectiveUrls']['awsAccount']  = prefix_url+data['region']+'#entities/AwsAccount/'+data['detail']['accountId']+'?scopeStart='+scopeStart+'&scopeEnd='+scopeEnd

        ## Get EC2 Instance URLs
        if "instanceDetails" in data['detail']['resource']:
            data['detail']['detectiveUrls']['ec2Instance']  = prefix_url+data['region']+'#entities/Ec2Instance/'+data['detail']['resource']['instanceDetails']['instanceId']+'?scopeStart='+scopeStart+'&scopeEnd='+scopeEnd
        
        ## Get nework intefaces info to form URLs
        ## Get private IP addresses from network interfaces
        if "networkInterfaces" in data['detail']['resource']['instanceDetails']:            
            privateIPs = find_key_value_pairs(data['detail'], 'networkInterfaces')
            
            index = 0
            if len(privateIPs) > 0:
                for k, v in privateIPs:
                    if (len(privateIPs) == 1 and len(v) == 1):
                        data['detail']['detectiveUrls']['privateIpAddress']  = prefix_url+data['region']+'#entities/IpAddress/'+v[index]['privateIpAddress']+'?scopeStart='+scopeStart+'&scopeEnd='+scopeEnd
                    else:
                        data['detail']['detectiveUrls']['privateIpAddress'+str(index + 1)]  = prefix_url+data['region']+'#entities/IpAddress/'+v[index]['privateIpAddress']+'?scopeStart='+scopeStart+'&scopeEnd='+scopeEnd
                    index += 1
            
            ## Get public IP addresses from network interfaces
            publicIPs = find_key_value_pairs(data['detail'], 'publicIp')
            
            index = 0
            if len(publicIPs) > 0:
                for k, v in publicIPs:
                    if len(publicIPs) == 1:
                        data['detail']['detectiveUrls']['publicIpAddress']  = prefix_url+data['region']+'#entities/IpAddress/'+v+'?scopeStart='+scopeStart+'&scopeEnd='+scopeEnd
                    else:
                        data['detail']['detectiveUrls']['publicIpAddress'+str(index + 1)]  = prefix_url+data['region']+'#entities/IpAddress/'+v+'?scopeStart='+scopeStart+'&scopeEnd='+scopeEnd
                    index += 1
 
        ## Get External IP addresses from services
        ## Get External local ip addresses
        localIpAddress = find_key_value_pairs(data['detail'], 'localIpDetails')
        
        index = 0
        if len(localIpAddress) > 0:
            for k, v in localIpAddress:
                if len(localIpAddress) == 1:
                    data['detail']['detectiveUrls']['localIpAddress']  = prefix_url+data['region']+'#entities/IpAddress/'+v['ipAddressV4']+'?scopeStart='+scopeStart+'&scopeEnd='+scopeEnd
                else:
                    data['detail']['detectiveUrls']['localIpAddress'+str(index + 1)]  = prefix_url+data['region']+'#entities/IpAddress/'+v['ipAddressV4']+'?scopeStart='+scopeStart+'&scopeEnd='+scopeEnd
                index += 1

        return_event['sourcetype'] = st
        return_event['event'] = data['detail']

        ## Get External Remote ip addresses
        remoteIpAddress = find_key_value_pairs(data['detail'], 'remoteIpDetails')
        
        index = 0
        if len(remoteIpAddress) > 0:
            for k, v in remoteIpAddress:
                if len(remoteIpAddress) == 1:
                    data['detail']['detectiveUrls']['remoteIpAddress']  = prefix_url+data['region']+'#entities/IpAddress/'+v['ipAddressV4']+'?scopeStart='+scopeStart+'&scopeEnd='+scopeEnd
                else:
                    data['detail']['detectiveUrls']['remoteIpAddress'+str(index + 1)]  = prefix_url+data['region']+'#entities/IpAddress/'+v['ipAddressV4']+'?scopeStart='+scopeStart+'&scopeEnd='+scopeEnd
                index += 1

        return_event['sourcetype'] = st

        if IS_PY3:
            # base64 encode api changes in python3 to operate exclusively on byte-like objects and bytes
            data = base64.b64encode(json.dumps(return_event).encode('utf-8')).decode()
        else:
            data = base64.b64encode(json.dumps(return_event))

        if len(data) <= 6000000:
            yield {
                'data': data,
                'result': 'Ok',
                'recordId': recId
            }
        else:
            yield {
                'result': 'ProcessingFailed',
                'recordId': recId
            }


def putRecordsToFirehoseStream(streamName, records, client, attemptsMade, maxAttempts):
    failedRecords = []
    codes = []
    errMsg = ''
    # if put_record_batch throws for whatever reason, response['xx'] will error out, adding a check for a valid
    # response will prevent this
    response = None
    try:
        response = client.put_record_batch(DeliveryStreamName=streamName, Records=records)
    except Exception as e:
        failedRecords = records
        errMsg = str(e)

    # if there are no failedRecords (put_record_batch succeeded), iterate over the response to gather results
    if not failedRecords and response and response['FailedPutCount'] > 0:
        for idx, res in enumerate(response['RequestResponses']):
            # (if the result does not have a key 'ErrorCode' OR if it does and is empty) => we do not need to re-ingest
            if 'ErrorCode' not in res or not res['ErrorCode']:
                continue

            codes.append(res['ErrorCode'])
            failedRecords.append(records[idx])

        errMsg = 'Individual error codes: ' + ','.join(codes)

    if len(failedRecords) > 0:
        if attemptsMade + 1 < maxAttempts:
            print('Some records failed while calling PutRecordBatch to Firehose stream, retrying. %s' % (errMsg))
            putRecordsToFirehoseStream(streamName, failedRecords, client, attemptsMade + 1, maxAttempts)
        else:
            raise RuntimeError('Could not put records after %s attempts. %s' % (str(maxAttempts), errMsg))


def putRecordsToKinesisStream(streamName, records, client, attemptsMade, maxAttempts):
    failedRecords = []
    codes = []
    errMsg = ''
    # if put_records throws for whatever reason, response['xx'] will error out, adding a check for a valid
    # response will prevent this
    response = None
    try:
        response = client.put_records(StreamName=streamName, Records=records)
    except Exception as e:
        failedRecords = records
        errMsg = str(e)

    # if there are no failedRecords (put_record_batch succeeded), iterate over the response to gather results
    if not failedRecords and response and response['FailedRecordCount'] > 0:
        for idx, res in enumerate(response['Records']):
            # (if the result does not have a key 'ErrorCode' OR if it does and is empty) => we do not need to re-ingest
            if 'ErrorCode' not in res or not res['ErrorCode']:
                continue

            codes.append(res['ErrorCode'])
            failedRecords.append(records[idx])

        errMsg = 'Individual error codes: ' + ','.join(codes)

    if len(failedRecords) > 0:
        if attemptsMade + 1 < maxAttempts:
            print('Some records failed while calling PutRecords to Kinesis stream, retrying. %s' % (errMsg))
            putRecordsToKinesisStream(streamName, failedRecords, client, attemptsMade + 1, maxAttempts)
        else:
            raise RuntimeError('Could not put records after %s attempts. %s' % (str(maxAttempts), errMsg))


def createReingestionRecord(isSas, originalRecord):
    if isSas:
        return {'data': base64.b64decode(originalRecord['data']), 'partitionKey': originalRecord['kinesisRecordMetadata']['partitionKey']}
    else:
        return {'data': base64.b64decode(originalRecord['data'])}


def getReingestionRecord(isSas, reIngestionRecord):
    if isSas:
        return {'Data': reIngestionRecord['data'], 'PartitionKey': reIngestionRecord['partitionKey']}
    else:
        return {'Data': reIngestionRecord['data']}


def handler(event, context):
    isSas = 'sourceKinesisStreamArn' in event
    streamARN = event['sourceKinesisStreamArn'] if isSas else event['deliveryStreamArn']
    region = streamARN.split(':')[3]
    streamName = streamARN.split('/')[1]
    records = list(processRecords(event['records']))
    projectedSize = 0
    dataByRecordId = {rec['recordId']: createReingestionRecord(isSas, rec) for rec in event['records']}
    putRecordBatches = []
    recordsToReingest = []
    totalRecordsToBeReingested = 0

    for idx, rec in enumerate(records):
        if rec['result'] != 'Ok':
            continue
        projectedSize += len(rec['data']) + len(rec['recordId'])
        # 6000000 instead of 6291456 to leave ample headroom for the stuff we didn't account for
        if projectedSize > 6000000:
            totalRecordsToBeReingested += 1
            recordsToReingest.append(
                getReingestionRecord(isSas, dataByRecordId[rec['recordId']])
            )
            records[idx]['result'] = 'Dropped'
            del(records[idx]['data'])

        # split out the record batches into multiple groups, 500 records at max per group
        if len(recordsToReingest) == 500:
            putRecordBatches.append(recordsToReingest)
            recordsToReingest = []

    if len(recordsToReingest) > 0:
        # add the last batch
        putRecordBatches.append(recordsToReingest)

    # iterate and call putRecordBatch for each group
    recordsReingestedSoFar = 0
    if len(putRecordBatches) > 0:
        client = boto3.client('kinesis', region_name=region) if isSas else boto3.client('firehose', region_name=region)
        for recordBatch in putRecordBatches:
            if isSas:
                putRecordsToKinesisStream(streamName, recordBatch, client, attemptsMade=0, maxAttempts=20)
            else:
                putRecordsToFirehoseStream(streamName, recordBatch, client, attemptsMade=0, maxAttempts=20)
            recordsReingestedSoFar += len(recordBatch)
            print('Reingested %d/%d records out of %d' % (recordsReingestedSoFar, totalRecordsToBeReingested, len(event['records'])))
    else:
        print('No records to be reingested')

    return {"records": records}