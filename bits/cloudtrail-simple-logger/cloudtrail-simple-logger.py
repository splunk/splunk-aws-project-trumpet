import gzip
import json
from io import BytesIO

import boto3

import logger


def lambda_handler(event, context):
    event_dict = event["Records"][0]
    bucket_name = event_dict["s3"]["bucket"]["name"]
    key = event_dict["s3"]["object"]["key"]

    s3 = boto3.resource('s3')
    obj = s3.Object(bucket_name, key)

    data = BytesIO(obj.get()['Body'].read())
    gzipfile = gzip.GzipFile(fileobj=data)
    data_json = json.dumps(json.loads(gzipfile.read()))


    hec = logger.trumpetLogger(context, event)
    hec.writebase("success", data_json)