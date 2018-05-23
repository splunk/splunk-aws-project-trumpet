import json
import httplib
import logging
from urllib2 import build_opener, HTTPHandler, Request
import boto3
import os

logger = logging.getLogger()
logger.setLevel(logging.INFO)
s3 = boto3.client('s3')
s3resource = boto3.resource('s3')
basePath = os.environ['LAMBDA_TASK_ROOT']

def handler(event, context):
    logger.info('REQUEST RECEIVED:\n {}'.format(event))
    logger.info('REQUEST RECEIVED:\n {}'.format(context))
    if event['RequestType'] == 'Create':
        # Push index.html + other frontend assets to the s3 bucket created
        s3.upload_file(basePath + '/build_source/index.html', event["ResourceProperties"]["S3Bucket"], 'index.html', ExtraArgs={'ContentType': "text/html"})
        s3.upload_file(basePath + '/build_source/main.03f47d269b5f5f9e64e4.js', event["ResourceProperties"]["S3Bucket"], 'main.03f47d269b5f5f9e64e4.js', ExtraArgs={'ContentType': "text/javascript"})
        logger.info('CREATE!')
        sendResponse(event, context, "SUCCESS", { "Message": "Resource creation successful!" })
    elif event['RequestType'] == 'Delete':
        logger.info('DELETE!')
        # force deletion of the s3 bucket created by CloudFormation
        bucket = s3resource.Bucket(event["ResourceProperties"]["S3Bucket"])
        # suggested by Jordon Philips 
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
