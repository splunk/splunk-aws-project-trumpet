import requests
import logging
import json
import boto3
from botocore.exceptions import ClientError
from urllib2 import build_opener, HTTPHandler, Request

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def get_secret(secret_name, ssm_endpoint_url, region_name):
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name,
        endpoint_url=ssm_endpoint_url
    )

    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )
    except ClientError as e:
        print e
        if e.response['Error']['Code'] == 'ResourceNotFoundException':
            print("The requested secret " + secret_name + " was not found")
        elif e.response['Error']['Code'] == 'InvalidRequestException':
            print("The request was invalid due to:", e)
        elif e.response['Error']['Code'] == 'InvalidParameterException':
            print("The request had invalid params:", e)
    else:
        if 'SecretString' in get_secret_value_response:
            secret = get_secret_value_response['SecretString']
            return secret
        else:
            binary_secret_data = get_secret_value_response['SecretBinary']
            return binary_secret_data


def handler(event, context):
    endpoint = event["ResourceProperties"]["SplunkHttpEventCollectorManagementURL"]
    splunk_user = event["ResourceProperties"]["SplunkUser"]
    secret_name = event["ResourceProperties"]["SecretManagerSecretName"]
    region_name = event["ResourceProperties"]["AWSRegion"]
    ssm_endpoint_url = "https://secretsmanager." + region_name + ".amazonaws.com"

    secret_response = get_secret(secret_name, ssm_endpoint_url, region_name)

    # List tokens and remove from token list if we already have them
    response = requests.get(endpoint + '/services/data/inputs/http?output_mode=json', verify=False,
                            auth=(splunk_user, secret_response))

    json_data = json.loads(response.text)

    cloudtrail_token_name = 'generated-cloudtrail'
    config_notification_token_name = 'generated-config-notification'
    config_snapshot_token_name = 'generated-config-snapshot'
    cloudwatch_token_name = 'generated-cloudwatch'
    guardduty_token_name = 'generated-guardduty'

    cloudtrail_sourcetype = 'aws:cloudtrail'
    config_notification_sourcetype = 'aws:config:notification'
    config_snapshot_sourcetype = 'aws:config'
    cloudwatch_sourcetype = 'aws:cloudwatch'
    guardduty_sourcetype = 'aws:cloudwatch:guardduty'

    token_names = [cloudtrail_token_name, config_notification_token_name, config_snapshot_token_name,
                   cloudwatch_token_name, guardduty_token_name]

    token_name_sourcetype_map = {cloudtrail_token_name: cloudtrail_sourcetype,
                                 config_notification_token_name: config_notification_sourcetype,
                                 config_snapshot_token_name: config_snapshot_sourcetype,
                                 cloudwatch_token_name: cloudwatch_sourcetype,
                                 guardduty_token_name: guardduty_sourcetype}

    for token_data in json_data["entry"]:
        token_name = token_data["name"].split("http://")[1]
        if token_name in token_name_sourcetype_map:
            del token_name_sourcetype_map[token_name]

    # Create tokens that don't already exist
    for token_name in token_name_sourcetype_map:
        print "Creating token: " + token_name
        sourcetype = token_name_sourcetype_map[token_name]

        data = [
            ('name', token_name),
        ]

        # source overrides for firehose sourcetypes
        if (sourcetype == "aws:config:notification" ):
            data.append(('source', "aws_firehose_confignotification"))
        if (sourcetype == "aws:cloudtrail"):
            data.append(('source', "aws_firehose_cloudtrail"))
        if (sourcetype == "aws:cloudwatch:guardduty"):
            data.append(('source', "aws_cloudwatchevents_guardduty"))

        response = requests.post(endpoint + '/services/data/inputs/http',
                                 data=data, verify=False, auth=(splunk_user, secret_response))

        data = [
            ('sourcetype', sourcetype),
            ('enabled', '1')
        ]

        # useACK overrides for firehose sourcetypes
        if (sourcetype == "aws:config:notification" or sourcetype == "aws:cloudtrail" or sourcetype == "aws:cloudwatch:guardduty"):
            data.append(('useACK', "1"))

        response = requests.post(
            endpoint + '/services/data/inputs/http/' + token_name, data=data,
            verify=False, auth=(splunk_user, secret_response))

    # Grab all tokens (included newly created ones - if any)
    response = requests.get(endpoint + '/services/data/inputs/http?output_mode=json', verify=False,
                            auth=(splunk_user, secret_response))

    json_data = json.loads(response.text)

    HEC_tokens = {}

    for token_data in json_data["entry"]:
        if (token_data["name"].split("http://")[1] in token_names):
            HEC_tokens[token_data["name"].split("http://")[1]] = token_data["content"]["token"]

    sendResponse(event, context, "SUCCESS", {"Message": "Splunk HEC configuration successful!",
                                             "CloudTrailHECToken": HEC_tokens["generated-cloudtrail"],
                                             "CloudWatchHECToken": HEC_tokens["generated-cloudwatch"],
                                             "ConfigNotificationHECToken": HEC_tokens["generated-config-notification"],
                                             "ConfigSnapshotHECToken": HEC_tokens["generated-config-snapshot"],
                                             "GuardDutyHECToken": HEC_tokens["generated-guardduty"]})

def sendResponse(event, context, responseStatus, responseData):
    responseBody = json.dumps({
        "Status": responseStatus,
        "Reason": "See the details in CloudWatch Log Stream: " + context.log_stream_name,
        "PhysicalResourceId": context.log_stream_name,
        "StackId": event['StackId'],
        "RequestId": event['RequestId'],
        "LogicalResourceId": event['LogicalResourceId'],
        "Data": responseData
    })

    logger.info('ResponseURL: {}'.format(event['ResponseURL']))
    logger.info('ResponseBody: {}'.format(responseBody))

    opener = build_opener(HTTPHandler)
    request = Request(event['ResponseURL'], data=responseBody)
    request.add_header('Content-Type', '')
    request.add_header('Content-Length', len(responseBody))
    request.get_method = lambda: 'PUT'
    response = opener.open(request)
    print("Status code: {}".format(response.getcode()))
    print("Status message: {}".format(response.msg))