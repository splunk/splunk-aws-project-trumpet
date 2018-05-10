# Instructions for launching at bottom of README

# aws-project-tumpet

# Why trumpet?
```
[5:13 PM] Kyle Champlin: there was an operating system called Windows 3.1
[5:13 PM] Kyle Champlin: which was one of the first Windows versions to implement "sockets"
[5:13 PM] Kyle Champlin: and there was a program called winsock trumpet
[5:13 PM] Kyle Champlin: which let you get in the internetz unabated by AOL
[5:14 PM] Kyle Champlin: the idea being we will be connecting people unabated to their AWS data
```
# Problem
The AWS TA impliments several AWS's generated data sources. The spluk side configuration is very straight forward but each AWS region requires repeating the Splunk setup, with is laborious. The AWS configuration to enable the data feeds is not stright forward and equally laborious. The friction of setup accounts for 45% of support tickets for the application. 

# Solution
Deliver streamlined configuration assistance to our AWS customers. Both the AWS and splunk configurations need to be generated and deployed. Trumpet will provide a control panel to evalute the regional status of each data feed, and baseline TA configuration status. IT will provide a control panel to enable AWS services as well a insure the correct configurations exist in the HF and (indexers?) Trumpet is designed to work in existing BYOL instnaces, SplunkCloud, and AWS Insights AMI in the marketplace.  

# Links 
https://confluence.splunk.com/display/PROD/AWS+GDI+Workflow   \
https://docs.splunk.com/Documentation/AddOns/released/AWS/CloudWatch#Configure_a_CloudWatch_input_using_Splunk_Web   \
http://docs.splunk.com/Documentation/AddOns/released/AWS/ConfigureInputs   \
https://splunk.app.box.com/s/4df4teepihis83p8493eybeb8l0dbl10   \
https://confluence.splunk.com/display/~kamir/Splunk+Cloud+%3A+Project+Awesome-o   

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
aws cloudformation deploy --template-file /Users/nstone/Desktop/trumpet_git/aws-project-trumpet/aws-splunk-config-automation/template.output.json --stack-name firehose_test --parameter-overrides SplunkHttpEventCollectorURL=https://35.164.180.39:8088/services/collector CloudTrailSplunkHttpEventCollectorToken=2ec0e288-4749-47fd-94ed-234c61ba357d ConfigSplunkHttpEventCollectorToken=2ec0e288-4749-47fd-94ed-234c61ba357d --capabilities CAPABILITY_IAM
```
aws cloudformation deploy --template-file template.output.json --stack-name { StackName } --parameter-overrides CloudTrailName=TrumpetTrail SplunkHttpEventCollectorURL=https://{{ Splunk server }}:8088/services/collector CloudTrailName={{ Custom name of CloudTrail that will be created if a valid one does not exist}} CloudTrailSplunkHttpEventCollectorToken={{ CloudTrail HEC token }} ConfigSplunkHttpEventCollectorToken={{ Config HEC token }} --capabilities CAPABILITY_IAM
```
# Open Splunk and view Config and CloudTrail output

##### Splunk server

Ask Nic Stone for access. Or spin up/use your own and add two new HEC tokens

##### Search (shows all messages inbound from Lambda):

(Search last 1hr - can take up 5 mins for cloudtrail to come in and 1hr for config to come in after launching template)

index="main" sourcetype="aws:cloudtrail"

If Splunk App for AWS is installed, check topology map and various other dashboards to see live populated visualizations and KPIsindex="main" sourcetype="aws:cloudtrail"