# How to use

# Package CloudFormation template:

Update the { BucketName } with an existing bucket in the region you wish to deploy in

Use the AWS CloudFormation console, or the following cli command
```
aws cloudformation package --template trumpet_discovered_or_new_trail_discovered_or_new_config_v0.1.json --s3-bucket { BucketName } --output-template-file template.output.json --use-json
```
# Deploy CloudFormation template:

Update the { StackName } with the name of the stack

Use the AWS CloudFormation console, or the following cli command
```
aws cloudformation deploy --template-file template.output.json --stack-name { StackName } --parameter-overrides CloudTrailName=TrumpetTrail SplunkHttpEventCollectorURL=https://{{ Splunk server }}:8088/services/collector CloudTrailName={{ Custom name of CloudTrail that will be created if a valid one does not exist}} CloudTrailSplunkHttpEventCollectorToken={{ CloudTrail HEC token }} ConfigSplunkHttpEventCollectorToken={{ Config HEC token }} --capabilities CAPABILITY_IAM
```
# Open Splunk and view Config and CloudTrail output

##### Splunk server

Ask Nic Stone for access. Or spin up/use your own and add two new HEC tokens

##### Search (shows all messages inbound from Lambda):

(Search last 1hr - can take up 5 mins for cloudtrail to come in and 1hr for config to come in after launching template)

index="main" sourcetype="aws:cloudtrail"

If Splunk App for AWS is installed, check topology map and various other dashboards to see live populated visualizations and KPIs