import boto3
import logging
import json
from urllib2 import build_opener, HTTPHandler, Request
from botocore.exceptions import ClientError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def handler(event, context):
    if (event["RequestType"] == "Delete"):
        print "Something?"
        sendResponse(event, context, "SUCCESS", {"Message": "Delete successful"})
    client = boto3.client('secretsmanager')
    splunk_password = event["ResourceProperties"]["SplunkPassword"]
    secret_name = event["ResourceProperties"]["SecretManagerSecretName"]

    try:
        response = client.create_secret(Name=secret_name, SecretString=splunk_password)
        sendResponse(event, context, "SUCCESS", {"Message": "Secret storage successful!"})
    except ClientError as e:
        sendResponse(event, context, "FAILED", {"Message": "Secret name already exists"})
        print e

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