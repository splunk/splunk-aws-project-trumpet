<img src="README-static-assets/trumpet_logo.png" width="450">

Trumpet is a tool that leverages AWS CloudFormation to set up all the AWS infrastructure needed to push AWS CloudTrail, AWS CloudWatch Metrics, and AWS Config data to Splunk using HTTP Event Collector (HEC). Once the template has been deployed, the user only needs the Splunk Add-on for AWS, Splunk Add-on for Amazon Kinesis Firehose and Splunk App for AWS installed on their Splunk instance in order to populate several of the dashboards included in the Splunk App for AWS with their data.

## To start using Trumpet
Trumpet is provided as a CloudFormation template that sets up an s3 backed static configuration site where you can customize the template to your requirements. Once configured, download the generated template and deploy it in the AWS regions you would like to collect data from.

There are two versions of the template. The first is a quickstart version that will automate much of the Splunk side configuration. This version will create and configure all required HTTP Event Collector tokens automatically. It does require the Splunk management port (default 8089) to be open while the template runs, as this is the port the template uses to interact with the token creating REST API.

The second version of the template requires the user to create HEC tokens for each AWS data source they would like to collect (up to 4 currently). Otherwise, both templates configure the same resources.
### 0. Splunk Prerequisites
Install the [Splunk App for AWS](https://splunkbase.splunk.com/app/1274/?), the [Splunk Add-on for AWS](https://splunkbase.splunk.com/app/1876/), and the [Splunk Add-on for AWS Kinesis Firehose](https://splunkbase.splunk.com/app/3719/) on the endpoint/s that will be receiving data using HTTP Event Collector.

* `[PRE RELEASE NOTE]` 
   * The current version of the Firehose TA does not support the aws:config:notification sourcetype, this can be fixed with a small addition to the props.conf and transforms.conf of the Firehose TA

### 1. Deploy the CloudFormation template

#### Automated HTTP Event Collector (HEC) configuration template
If using the automatic HEC configuration version of the template, download the `configuration_website_builder_template_hec_auto_config.json` and launch the stack in the AWS CloudFormation console. 
[<img src="https://s3.amazonaws.com/cloudformation-examples/cloudformation-launch-stack.png">](https://www.google.com)

Once the template has finished deploying the template will output a url linking to the Splunk configuration website. You can find this url in the outputs tab of the AWS CloudFormation console.

Open the generated url to access the configuration site. Note: this site runs entirely local to your browser. Any information entered is not sent anywhere.

#### Manual HTTP Event Collector (HEC) configuration template

If using the manual HEC configuration version of the template, download the `configuration_website_builder_template_no_auto_config.json` and deploy using the AWS CloudFormation console.
[<img src="https://s3.amazonaws.com/cloudformation-examples/cloudformation-launch-stack.png">](https://www.google.com)
If you prefer to use the AWS CLI to deploy, download the template and launch the stack using the following CLI command. Change the stack-name value if needed.
```
$ aws cloudformation deploy --template-file configuration_website_builder_template_no_auto_config.json --stack-name "splunk-aws-configuration-site" --capabilities CAPABILITY_IAM
```

The template will output a url once it has completed deploying linking to the Splunk configuration website. You can find this url in the outputs tab of the AWS CloudFormation Console by running the following AWS CLI command.
```
$ aws cloudformation describe-stacks --stack-name splunk-aws-configuration-site --query 'Stacks[0].Outputs'
```

Open the generated url to access the configuration site. Note: this site runs entirely local to your browser. Any information entered is not sent anywhere.

### 2. Choose your preferences using the configuration site

<img src="README-static-assets/config_manual_hec_img.png">

Select which AWS services you would like to collect from. If you are not running the version of the template which automates HEC token creation, you will need to provide an enabled Splunk HTTP Event Collector Token for each data source, as well as the HTTP Event Collector endpoint of your Splunk environment. See the `Manual Token Setup` section of this documentation.

After you have entered in the details about your Splunk environment and/or made your data collection selections, download the customized template. You can now run this template in the AWS CloudFormation console, or with the following AWS CLI command.

### 3. Deploy the generated custom CloudFormation template

Deploy the template in the AWS CloudFormation console.

If you prefer to use the AWS CLI, the below command will also deploy the template.
```
$ aws cloudformation deploy --template-file customized_splunk_aws_template.json --stack-name "splunk-aws-automation" --capabilities CAPABILITY_IAM
```

After 5-10 minutes, Splunk will begin receiving data from the configured AWS services. You should now delete the first stack - which deployed the created the configuration website.

### Manual token setup
Setting up the tokens required from the Splunk GUI is a straightforward process. For each supported sourcetype that you would like to ingest into Splunk, you will need to create a HEC token on the Splunk side (Depending on your Splunk architecture, this can be a deployment server, a Splunk instance acting as a forwarder, etc.).

Currently 5 sourcetypes are supported by the automation templates
* aws:config
* aws:config:notification
* aws:cloudtrail
* aws:cloudwatch:guardduty
* aws:cloudwatch

Create a token for each of the above sourcetypes that you would like to ingest into Splunk. Soe tokens have specific settings to ensure correct ingestion. Configuration for each token is detailed below.

TODO

* aws:config
    * name: 
* aws:config:notification
* aws:cloudtrail
* aws:cloudwatch:guardduty
* aws:cloudwatch

## Troubleshooting
- Check that each HEC token is enabled and that SSL is turned on
- For the tokens associated with the aws:config:notification and aws:cloudtrail sourcetypes, indexer acknowledgement should be turned on. This can be confirmed in the Splunk GUI or in inputs.conf (The token stanza should have `useACK=1`)
- Check the firehose settings in AWS. The listed HEC endpoint should have a valid SSL cert installed for the HEC port. Confirm the cert is valid by visiting `https://{{ endpoint }}:8088/services/collector/health`. If you do not get a security warning, SSL using a valid cert for HEC is correctly configured. Otherwise you need to use a valid cert or use an ELB intermediary to terminate SSL before forwarding to your HEC endpoint.
- Enable CloudWatch logs on each Kinesis Firehose Delivery stream
- The aws:config sourcetype is populated by AWS Config snapshots. To check available delivery channels and snapshot delivery frequency settings run the below command.
```
$ aws configservice describe-delivery-channels
```
- Config snapshot delivery settings can be modified using the `put-delivery-channel` AWS CLI command. Instructions [here](https://docs.aws.amazon.com/cli/latest/reference/configservice/put-delivery-channel.html).
- For aws:config run the below command to manually deliver a snapshot (you may need to change the delivery channel name)
```
$ aws configservice deliver-config-snapshot --delivery-channel-name default
```
- Check the CloudWatch logs for malfunctioning Lambdas.
- If the `aws:config:notification` sourcetype is not being ingested, check that the AWS Config recorder is turned on. The recorder should be turned on by the template, however if there is an existing recorder that is turned off when the template runs, the recorder will need to be turned on manually from the AWS Console or using the AWS CLI.
- In progress...

## Support

Trumpet is currently maintained by [nstonesplunk](https://github.com/nstonesplunk)
