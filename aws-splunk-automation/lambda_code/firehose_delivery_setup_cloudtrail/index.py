import json
import httplib
import logging
from urllib2 import build_opener, HTTPHandler, Request
import boto3
import os
from botocore.exceptions import ClientError

logger = logging.getLogger()
logger.setLevel(logging.INFO)
client = boto3.client('firehose')
s3resource = boto3.resource('s3')
# Removing /services/collector from url
SPLUNK_HEC_URL = os.environ['SPLUNK_HEC_URL'].replace("/services/collector", "")
SPLUNK_HEC_TOKEN = os.environ['SPLUNK_HEC_TOKEN']

def handler(event, context):
    logger.info('REQUEST RECEIVED:\n {}'.format(event))
    logger.info('REQUEST RECEIVED:\n {}'.format(context))
    if event['RequestType'] == 'Create':
        try:
            response = client.create_delivery_stream(
                DeliveryStreamName='splunk-cloudtrail-cwe-monitoring',
                DeliveryStreamType='DirectPut',
                SplunkDestinationConfiguration={
                    'HECEndpoint': SPLUNK_HEC_URL,
                    'HECEndpointType': 'Raw',
                    'HECToken': SPLUNK_HEC_TOKEN,
                    'HECAcknowledgmentTimeoutInSeconds': 180,
                    'RetryOptions': {
                        'DurationInSeconds': 300
                    },
                    'S3BackupMode': 'FailedEventsOnly',
                    'S3Configuration': {
                        'RoleARN': event["ResourceProperties"]["CloudTrailBackupS3Role"],
                        'BucketARN': event["ResourceProperties"]["CloudTrailBackupS3Bucket"],
                        'BufferingHints': {
                            'SizeInMBs': 5,
                            'IntervalInSeconds': 300
                        },
                        'CompressionFormat': 'UNCOMPRESSED',
                        # "CloudWatchLoggingOptions": {
                        #     "Enabled": True,
                        #     "LogGroupName": "/aws/kinesisfirehose/splunk-cloudtrail-cwe-monitoring",
                        #     "LogStreamName": "S3Delivery"
                        # }
                    },
                    'ProcessingConfiguration': {
                        'Enabled': False
                    },
                    # "CloudWatchLoggingOptions": {
                    #     "Enabled": True,
                    #     "LogGroupName": "/aws/kinesisfirehose/splunk-cloudtrail-cwe-monitoring",
                    #     "LogStreamName": "SplunkDelivery"
                    # }
                }
            )
        except ClientError as e:
            sendResponse(event, context, "FAILED", {"Message": "Delivery Stream failed to create: " + str(e) })

        logger.info('CREATE!')
        sendResponse(event, context, "SUCCESS", { "Message": "Resource creation successful!" })
    elif event['RequestType'] == 'Delete':
        logger.info('DELETE!')

        try:
            response = client.delete_delivery_stream(
                DeliveryStreamName='splunk-cloudtrail-cwe-monitoring'
            )
        except ClientError as e:
            sendResponse(event, context, "FAILED", {"Message": "Delivery Stream failed to create: " + str(e) })

        bucket = s3resource.Bucket(event["ResourceProperties"]["CloudTrailBackupS3BucketName"])
        bucket.objects.all().delete()
        bucket.delete()

        sendResponse(event, context, "SUCCESS", { "Message": "Resource deletion successful!" })
    else:
        logger.info('FAILED!')
        sendResponse(event, context, "FAILED", { "Message": "Unexpected event received from CloudFormation" })
        return

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
