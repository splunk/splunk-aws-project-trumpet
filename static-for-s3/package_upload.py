import os
import boto3
import zipfile
import re

# Follow below s3 bucket naming convention when creating new buckets
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
    'trumpet-splunk-prod-sa-east-1', # CREATED
    'trumpet-splunk-prod-eu-north-1', # CREATED
    'trumpet-splunk-prod-ap-northeast-3', # CREATED
    'trumpet-splunk-prod-ap-east-1', # CREATED
    'trumpet-splunk-prod-af-south-1', # CREATED
    'trumpet-splunk-prod-me-south-1' # CREATED
    'trumpet-splunk-prod-eu-south-1', # CREATED
]

serverless = boto3.session.Session(profile_name='serverless')
automation_configuration_path_base = '../splunk-aws-automation-configuration/lambda_code'
automation_path_base = '../splunk-aws-automation/lambda_code'

def zipDir(dirPath, zipPath):
    zipf = zipfile.ZipFile(zipPath, mode='w')
    lenDirPath = len(dirPath)
    for root, _ , files in os.walk(dirPath):
        for d in _:
            os.chmod(os.path.join(root, d), 0o777)
        for file in files:
            if (file[0] != '.'):
                filePath = os.path.join(root, file)
                os.chmod(filePath, 0o777)
                zipf.write(filePath, filePath[lenDirPath :] )
    zipf.close()

# Automation configuration artifact zip and upload
for directory in os.listdir(automation_configuration_path_base):
    if (directory[0] != '.'):
        zipDir(automation_configuration_path_base + '/' + directory + '/', directory + '.zip')
        for bucket in buckets:
            print("Automation configuration artifact:{} {}".format(bucket, directory))
            with open(directory + '.zip', 'rb') as data:
                match = re.search(r'trumpet-splunk-prod-(.*)$', bucket)
                if match.group(1):
                    s3 = serverless.client('s3', match.group(1))
                    s3.upload_fileobj(data, bucket, directory + '.zip', ExtraArgs={'ACL':'public-read'})
                else:
                    print("Incorrect region name suffix in bucket name {}".format(bucket))


# Automation artifact zip and upload
for directory in os.listdir(automation_path_base):
    if (directory[0] != '.' and directory != 'v0.1' and directory != 'v0.2'):
        zipDir(automation_path_base + '/' + directory + '/', directory + '.zip')
        for bucket in buckets:
            print("Automation artifact:{} {}".format(bucket, directory))
            with open(directory + '.zip', 'rb') as data:
                match = re.search(r'trumpet-splunk-prod-(.*)$', bucket)
                if match.group(1):
                    s3 = serverless.client('s3', match.group(1))
                    s3.upload_fileobj(data, bucket, directory + '.zip', ExtraArgs={'ACL':'public-read'})
                else:
                    print("Incorrect region name suffix in bucket name {}".format(bucket))
