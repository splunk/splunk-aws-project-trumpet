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

## Configure HEC 
* **requires conformation to be turned on**
* **do not configure SSL on HEC**
	* store key
* Configure ALB for HEC 
 * require SSL offload

 ## HF EC2 role 
 * create EC2 role for HF
 * Broad list/read rights to test for each GDI control
 	* this will end up being one of the most iteratively changed object as new data feeds will be created all the time

 ## S3 Worker Lambda role
 * lambda execution role
 	* SNS read/list
 	* S3 read/list/write

  ## 



## CloudTrail
* Test for access to API's to read cloudtrail info
	* test each region for a trail that has SNS configured
	* Offer to configure missing regions
* depploy lambda function in each reagion
* create overflow S3 bucket for each region
* configure bucket for security - 
	* cofigure lambda with HEC


# Package CloudFormation template:

Update the { BucketName } with an existing bucket

```
aws cloudformation package --template trumpet_template --s3-bucket { BucketName } --output-template-file template.output.json --use-json
```
# Deploy CloudFormation template:

Update the { StackName } with the name of the stack

```
aws cloudformation deploy --template-file template.output.json --stack-name { StackName } --parameter-overrides SplunkHttpEventCollectorURL=https://54.202.136.110:8088/services/collector SplunkHttpEventCollectorToken=3c0c3b40-0940-4e29-8557-826f9cea1575 --capabilities CAPABILITY_IAM
```
# Open Splunk and view lambda output

##### Splunk server: http://54.202.136.110:8000/en-US/app/search/search

user: admin

pw: Splunkr3k0g1t!

##### Search (shows all messages inbound from Lambda):

(Search All time)

index="main" host="lambda" lambda_status="success"