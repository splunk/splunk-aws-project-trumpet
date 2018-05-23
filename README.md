<img src="README-static-assets/trumpet_logo.png" width="450">

Trumpet is a dynamic CloudFormation template that sets up all the AWS infrastructure needed to send AWS CloudTrail, AWS CloudWatch Metrics, and AWS Config data to Splunk using HTTP Event Collector (HEC). Once the template has been deployed, the user only needs the AWS Add-on and App installed (or packaged in their deployed AMI, etc.) on their Splunk instance in order to populate several of the dashboards included in the Splunk App for AWS with their data.

![Alt text](README-static-assets/config_img.png?raw=true)

## To start using Trumpet
Trumpet is provided as a CloudFormation template that sets up an s3 back static configuration site where you can customize the template to your requirements. Once configured, launch the generated template in the regions you would like to collect AWS data from.

### Package the CloudFormation template

Use the AWS CloudFormation console, or the following AWS CLI command. Update `{ BucketName }` in the command with an existing bucket in the region you wish to deploy in.
```
aws cloudformation package 
    --template cf_website_builder_test/website_builder_lambda.json 
    --s3-bucket { BucketName } --output-template-file template.output.json 
    --use-json
```

### Deploy the CloudFormation template

Use the AWS CloudFormation console, or the following cli command. Update `{ StackName }` in the command with the name of the stack

```
aws cloudformation deploy 
    --template-file template.output.json 
    --stack-name { StackName } 
    --capabilities CAPABILITY_IAM
```

### Support

Trumpet is currently maintained by [nstonesplunk](https://github.com/nstonesplunk)
