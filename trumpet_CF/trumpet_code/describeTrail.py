import boto3
import logger

def lambda_handler(event, context):
    client = boto3.client('cloudtrail')
    
    # TODO error handling
    response = client.describe_trails(
        trailNameList=[]
    )
    
    hec = logger.trumpetLogger(context, event)
    hec.writebase("success", response)