import requests
import logging
import json
import boto3
from botocore.exceptions import ClientError
from urllib2 import build_opener, HTTPHandler, Request

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def handler(event, context):
    endpoint = event["ResourceProperties"]["SplunkHttpEventCollectorManagementURL"]
    splunk_user = event["ResourceProperties"]["SplunkUser"]
    splunk_password = event["ResourceProperties"]["SplunkPassword"]

    # List tokens and remove from token list if we already have them
    response = requests.get(endpoint + '/services/data/inputs/http?output_mode=json', verify=False,
                            auth=(splunk_user, splunk_password))

    json_data = json.loads(response.text)

    indexer_no_ack_token_name = 'generated-indexer-no-ack'
    indexer_ack_token_name = 'generated-indexer-ack'

    token_names = [indexer_no_ack_token_name, indexer_ack_token_name]

    for token_data in json_data["entry"]:
        token_name = token_data["name"].split("http://")[1]
        if token_name in token_names:
            token_names.remove(token_name)

    # Create tokens that don't already exist
    for token_name in token_names:
        print "Creating token: " + token_name


        data = [
            ('name', token_name),
        ]

        response = requests.post(endpoint + '/services/data/inputs/http',
                                 data=data, verify=False, auth=(splunk_user, splunk_password))

        data = [
            ('enabled', '1')
        ]

        # useACK overrides for firehose sourcetypes
        if (token_name == indexer_ack_token_name):
            data.append(('useACK', "1"))

        response = requests.post(
            endpoint + '/services/data/inputs/http/' + token_name, data=data,
            verify=False, auth=(splunk_user, splunk_password))

    # Grab all tokens (included newly created ones - if any)
    response = requests.get(endpoint + '/services/data/inputs/http?output_mode=json', verify=False,
                            auth=(splunk_user, splunk_password))

    json_data = json.loads(response.text)

    HEC_tokens = {}
    token_names = [indexer_no_ack_token_name, indexer_ack_token_name]

    for token_data in json_data["entry"]:
        if (token_data["name"].split("http://")[1] in token_names):
            HEC_tokens[token_data["name"].split("http://")[1]] = token_data["content"]["token"]

    sendResponse(event, context, "SUCCESS", {"Message": "Splunk HEC configuration successful!",
                                             "IndexerAckHECToken": HEC_tokens["generated-indexer-ack"],
                                             "IndexerNoAckHECToken": HEC_tokens["generated-indexer-no-ack"]})

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