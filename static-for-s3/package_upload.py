import os
import boto3
import zipfile

buckets = [
    'trumpet-splunk-prod-us-east-1', # CREATED
    'trumpet-splunk-prod-us-east-2', # CREATED
    'trumpet-splunk-prod-us-west-1', # CREATED
    'trumpet-splunk-prod-us-west-2', # CREATED
    'trumpet-splunk-prod-ca-central-1', # CREATED
    'trumpet-splunk-prod-eu-central-1', # CREATED
    'trumpet-splunk-prod-eu-west-1', # CREATED
    'trumpet-splunk-prod-eu-west-2', # CREATED
    'trumpet-splunk-prod-eu-west-3', # CREATED
    'trumpet-splunk-prod-ap-northeast-1', # CREATED
    'trumpet-splunk-prod-ap-northeast-2', # CREATED
    'trumpet-splunk-prod-ap-southeast-1', # CREATED
    'trumpet-splunk-prod-ap-southeast-2', # CREATED
    'trumpet-splunk-prod-ap-south-1', # CREATED
    'trumpet-splunk-prod-sa-east-1' # CREATED
]

serverless = boto3.session.Session(profile_name='serverless')

s3 = serverless.client('s3')
automation_configuration_path_base = '../splunk-aws-automation-configuration/lambda_code'
automation_path_base = '../splunk-aws-automation/lambda_code'

def zipDir(dirPath, zipPath):
    zipf = zipfile.ZipFile(zipPath , mode='w')
    lenDirPath = len(dirPath)
    for root, _ , files in os.walk(dirPath):
        for file in files:
            if (file[0] != '.'):
                filePath = os.path.join(root, file)
                zipf.write(filePath , filePath[lenDirPath :] )
    zipf.close()

# Automation configuration artifact zip and upload
for directory in os.listdir(automation_configuration_path_base):
    if (directory[0] != '.'):
        zipDir(automation_configuration_path_base + '/' + directory + '/', directory + '.zip')
        for bucket in buckets:
            print 'Automation configuration artifact:' + bucket + ' ' + directory
            with open(directory + '.zip', 'rb') as data:
                s3.upload_fileobj(data, bucket, directory + '.zip')


# Automation artifact zip and upload
for directory in os.listdir(automation_path_base):
    if (directory[0] != '.' and directory != 'v0.1'):
        zipDir(automation_path_base + '/' + directory + '/', directory + '.zip')
        for bucket in buckets:
            print 'Automation artifact:' + bucket + ' ' + directory
            with open(directory + '.zip', 'rb') as data:
                s3.upload_fileobj(data, bucket, directory + '.zip')