## NOTE: Replace 'naive' logger with CT Grazer once it is open sourced

# How to use

# Package CloudFormation template:

Update the { BucketName } with an existing bucket in us-west-1 (only has 4 trails up currently)

Use the AWS CloudFormation console, or the following cli command
```
aws cloudformation package --template trumpet_new_v0.1.json --s3-bucket { BucketName } --output-template-file template.output.json --use-json
```
# Deploy CloudFormation template:

Update the { StackName } with the name of the stack

Use the AWS CloudFormation console, or the following cli command
```
aws cloudformation deploy --template-file template.output.json --stack-name { StackName } --parameter-overrides CloudTrailName=TrumpetTrail SplunkHttpEventCollectorURL=https://54.202.136.110:8088/services/collector SplunkHttpEventCollectorToken=2047a393-d822-49be-ace0-f242b9cef12b --capabilities CAPABILITY_IAM
```
# Open Splunk and view lambda output

##### Splunk server: http://54.202.136.110:8000/en-US/app/search/search

user: admin

pw: Splunkr3k0g1t!

##### Search (shows all messages inbound from Lambda):

(Search All time)

index="main" sourcetype="aws:cloudtrail"