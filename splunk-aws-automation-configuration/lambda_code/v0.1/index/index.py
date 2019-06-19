import json
import httplib
import logging
from urllib2 import build_opener, HTTPHandler, Request
import boto3
import os
import re

logger = logging.getLogger()
logger.setLevel(logging.INFO)
s3 = boto3.client('s3')
s3resource = boto3.resource('s3')
basePath = os.environ['LAMBDA_TASK_ROOT']
AutoHEC = os.environ['AutoHEC']
if (AutoHEC == "true"):
    CloudTrailHECToken = os.environ['CloudTrailHECToken']
    CloudWatchHECToken = os.environ['CloudWatchHECToken']
    ConfigNotificationHECToken = os.environ['ConfigNotificationHECToken']
    ConfigSnapshotHECToken = os.environ['ConfigSnapshotHECToken']
    GuardDutyHECToken = os.environ['GuardDutyHECToken']
    SplunkHttpEventCollectorURL = os.environ['SplunkHttpEventCollectorURL']

def handler(event, context):
    logger.info('REQUEST RECEIVED:\n {}'.format(event))
    logger.info('REQUEST RECEIVED:\n {}'.format(context))
    if event['RequestType'] == 'Create':
        # Push index.html + other frontend assets (js file and robots.txt) to the s3 bucket created
        for filename in os.listdir(basePath + '/build_source'):
            if (filename[0] == "."):
                continue
            if filename.endswith(".html"):
                s3.upload_file(basePath + '/build_source/' + filename, event["ResourceProperties"]["S3Bucket"], filename, ExtraArgs={'ContentType': "text/html"})
            if filename.endswith(".txt"):
                s3.upload_file(basePath + '/build_source/' + filename, event["ResourceProperties"]["S3Bucket"], filename, ExtraArgs={'ContentType': "text/plain"})
            if filename.endswith(".js"):
                if (AutoHEC == "true"):
                    f = open(basePath + '/build_source/' + filename, "r")
                    data = f.readlines()
                    f.close()
                    new_js = []
                    for line in data:
                        match_string = "var dynamicValues = \{ 'AWS Config Notifications': '', 'AWS Config Snapshots': '', 'AWS CloudTrail': '', 'AWS CloudWatch Metrics': '', 'AWS GuardDuty': '', 'ConfigNotificationsHECToken': '', 'ConfigSnapshotHECToken': '', 'CloudTrailHECToken': '', 'CloudWatchHECToken': '', 'GuardDutyHECToken': '', 'AutoHEC': false, 'EndpointField': '', 'EndpointValue': '' \};"
                        replacement_string = "var dynamicValues = { 'AWS Config Notifications': 'none', 'AWS Config Snapshots': 'none', 'AWS CloudTrail': 'none', 'AWS CloudWatch Metrics': 'none', 'AWS GuardDuty': 'none', 'ConfigNotificationsHECToken': '%s', 'ConfigSnapshotHECToken': '%s', 'CloudTrailHECToken': '%s', 'CloudWatchHECToken': '%s', 'GuardDutyHECToken': '%s', 'AutoHEC': true, 'EndpointField': 'none', 'EndpointValue': '%s' };" % (ConfigNotificationHECToken, ConfigSnapshotHECToken, CloudTrailHECToken, CloudWatchHECToken, GuardDutyHECToken, SplunkHttpEventCollectorURL)
                        line, match_count = re.subn(match_string, replacement_string, line)
                        new_js.append(line)

                    f = open('/tmp/' + filename, "w")

                    for line in new_js:
                        f.write(line)

                    f.close()


                    s3.upload_file('/tmp/' + filename, event["ResourceProperties"]["S3Bucket"], filename, ExtraArgs={'ContentType': "text/javascript"})
                else:
                    s3.upload_file(basePath + '/build_source/' + filename, event["ResourceProperties"]["S3Bucket"], filename, ExtraArgs={'ContentType': "text/javascript"})


        logger.info('CREATE!')
        sendResponse(event, context, "SUCCESS", { "Message": "Resource creation successful!" })
    elif event['RequestType'] == 'Delete':
        logger.info('DELETE!')
        # force deletion of the s3 bucket created by CloudFormation
        bucket = s3resource.Bucket(event["ResourceProperties"]["S3Bucket"])
        bucket.objects.all().delete()
        # for obj in bucket.objects.all():
        #    obj.delete()
        bucket.delete()
        sendResponse(event, context, "SUCCESS", { "Message": "Resource deletion successful!" })
    else:
        logger.info('FAILED!')
        sendResponse(event, context, "FAILED", { "Message": "Unexpected event received from CloudFormation" })

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
