import os
import boto3
import zipfile

buckets = ["trumpet-splunk-us-west-2", "trumpet-splunk-eu-west-1", "trumpet-splunk-eu-west-2"]

s3 = boto3.client('s3')
automation_configuration_path_base = "../splunk-aws-automation-configuration/lambda_code"
automation_path_base = "../splunk-aws-automation/lambda_code"

def zipDir(dirPath, zipPath):
    zipf = zipfile.ZipFile(zipPath , mode='w')
    lenDirPath = len(dirPath)
    for root, _ , files in os.walk(dirPath):
        for file in files:
            if (file[0] != "."):
                filePath = os.path.join(root, file)
                zipf.write(filePath , filePath[lenDirPath :] )
    zipf.close()

# Automation configuration artifact zip and upload
for directory in os.listdir(automation_configuration_path_base):
    if (directory[0] != "."):
        zipDir(automation_configuration_path_base + "/" + directory + "/", directory + ".zip")
        for bucket in buckets:
            with open(directory + ".zip", 'rb') as data:
                s3.upload_fileobj(data, bucket, directory + ".zip")


# Automation artifact zip and upload
for directory in os.listdir(automation_path_base):
    if (directory[0] != "."):
        zipDir(automation_path_base + "/" + directory + "/", directory + ".zip")
        for bucket in buckets:
            with open(directory + ".zip", 'rb') as data:
                s3.upload_fileobj(data, bucket, directory + ".zip")