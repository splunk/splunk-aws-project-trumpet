<img src="README-static-assets/trumpet_logo.png" width="450">

Trumpet is a tool that leverages AWS CloudFormation to set up all the AWS infrastructure needed to push AWS CloudTrail, AWS Config, and AWS GuardDuty data to Splunk using HTTP Event Collector (HEC). Once the template has been deployed, the user only needs the Splunk Add-on for AWS, Splunk Add-on for Amazon Kinesis Firehose and Splunk App for AWS installed on their Splunk environment in order to populate several of the dashboards included in the Splunk App for AWS with their data.

## To start using Trumpet
Trumpet is provided as a CloudFormation template that sets up an s3 backed static configuration site where you can customize the template to your requirements. Once configured, download the generated template and deploy it in the AWS regions you would like to collect data from.

There are two versions of the template. The first is a quickstart version that will automate much of the Splunk side configuration. This version will create and configure all required HTTP Event Collector tokens automatically. It does require the Splunk management port (default 8089) to be open while the template runs, as this is the port the template uses to interact with the token creating REST API.

The second version of the template requires the user to create HEC tokens for each AWS data source they would like to collect (up to 4 currently). Otherwise, note that both templates will configure the same AWS resources.
### 0. Splunk Prerequisites
Install the [Splunk App for AWS](https://splunkbase.splunk.com/app/1274/?), the [Splunk Add-on for AWS](https://splunkbase.splunk.com/app/1876/), and the [Splunk Add-on for AWS Kinesis Firehose](https://splunkbase.splunk.com/app/3719/) on the endpoint/s that will be receiving data using HTTP Event Collector.

* A note about the AWS Config Notification data source: 
   * The current version of the Firehose TA does not support the `aws:config:notification` sourcetype, this can be fixed with a small addition to the props.conf and transforms.conf of the Firehose TA.
   * Add this stanza to `props.conf`
       * ```
           # Set Source to aws_firehose_confignotification when ingesting data
          [source::aws_firehose_confignotification]
          TRANSFORMS-extract_detail_from_cloudwatch_events=extract_detail_from_cloudwatch_events
          TRANSFORMS-use_for_cloudtrail_sourcetype_change=use_for_confignotification_sourcetype_change
          LINE_BREAKER=(([\r\n]+)|(?={"version":"[\d.]+","id":))
          SHOULD_LINEMERGE = false
          NO_BINARY_CHECK = false
          TRUNCATE = 8388608
          TIME_PREFIX = \"notificationCreationTime\"\s*\:\s*\"
          TIME_FORMAT = %Y-%m-%dT%H:%M:%S%Z
          MAX_TIMESTAMP_LOOKAHEAD = 28
          sourcetype = aws:config:notification
          ```
   * Add this stanza to `transforms.conf`
       *  ```
          [use_for_confignotification_sourcetype_change]
          REGEX = .*
          DEST_KEY = MetaData:Sourcetype
          FORMAT = sourcetype::aws:config:notification
          ```
          
### 1. Deploy the CloudFormation template

#### Option 1: Automated HTTP Event Collector (HEC) configuration template
If using the automatic HEC configuration version of the template, download the `auto_hec_conf_website_template.json` and launch the stack in the AWS CloudFormation console. 

Once the template has finished deploying the template will output a url linking to the Splunk configuration website. You can find this url in the outputs tab of the AWS CloudFormation console.

Open the generated url to access the configuration site. Note: this site runs entirely local to your browser. Any information entered is not sent anywhere.

#### Option 2: Manual HTTP Event Collector (HEC) configuration template

If using the manual HEC configuration version of the template, download the `no_auto_hec_conf_website_template.json` and deploy using the AWS CloudFormation console.

If you prefer to use the AWS CLI to deploy, download the template and launch the stack using the following CLI command. Change the stack-name value if needed.
```
$ aws cloudformation deploy --template-file no_auto_hec_conf_website_template.json --stack-name "splunk-aws-configuration-site" --capabilities CAPABILITY_IAM
```

The template will output a url linking to a one-time Splunk configuration website once it has completed deployment. You can find this url in the outputs tab of the AWS CloudFormation Console, or by running the following AWS CLI command.
```
$ aws cloudformation describe-stacks --stack-name splunk-aws-configuration-site --query 'Stacks[0].Outputs'
```

Open the generated url to access the configuration site. Note that this site runs entirely local to your browser.

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

After 5-10 minutes, Splunk will begin receiving data from the configured AWS services. You should now delete the first stack - which deployed the configuration website.

### Manual token setup
Setting up the tokens required from the Splunk GUI is a straightforward process. For each supported sourcetype that you would like to ingest into Splunk, you will need to create a HEC token on the Splunk side (Depending on your Splunk architecture, this can be a deployment server, a Splunk instance acting as a forwarder, etc.).

Currently 4 sourcetypes are supported by the automation templates
* ***aws:config***
* ***aws:config:notification***
* ***aws:cloudtrail***
* ***aws:cloudwatch:guardduty***

Create a token for each of the above sourcetypes that you would like to ingest into Splunk. Soe tokens have specific settings to ensure correct ingestion. Configuration for each token is detailed below.

* ***aws:config***
    * **Name:** Enter a name of your choice
    * **Enable indexer acknowledgement:** checked
    * **Source type:** aws:config
    * **Index:** selection should align to options described [here](https://docs.splunk.com/Documentation/AWS/5.1.1/Installation/Macros)
    * **App Context:** splunk_httpinput (splunk_httpinput)
* ***aws:config:notification***
    * **Name:** Enter a name of your choice
    * **Enable indexer acknowledgement:** checked
    * **Source name override:** aws_firehose_confignotification
    * **Source type:** aws:config:notification
    * **Index:** selection should align to options described [here](https://docs.splunk.com/Documentation/AWS/5.1.1/Installation/Macros)
    * **App Context:** splunk_httpinput (splunk_httpinput)
* ***aws:cloudtrail***
    * **Name:** Enter a name of your choice
    * **Enable indexer acknowledgement:** checked
    * **Source name override:** aws_firehose_cloudtrail
    * **Source type:** aws:cloudtrail
    * **Index:** selection should align to options described [here](https://docs.splunk.com/Documentation/AWS/5.1.1/Installation/Macros)
    * **App Context:** splunk_httpinput (splunk_httpinput)
* ***aws:cloudwatch:guardduty***
    * **Name:** Enter a name of your choice
    * **Enable indexer acknowledgement:** checked
    * **Source name override:** aws_cloudwatchevents_guardduty
    * **Source type:** aws:cloudwatch:guardduty]
    * **Index:** selection should align to options described [here](https://docs.splunk.com/Documentation/AWS/5.1.1/Installation/Macros)
    * **App Context:** splunk_httpinput (splunk_httpinput)

## Troubleshooting
- Check that each HEC token is enabled and that SSL is turned on
- For the tokens associated with the aws:config:notification and aws:cloudtrail sourcetypes, indexer acknowledgement should be turned on. This can be confirmed in the Splunk GUI or in inputs.conf (The token stanza should have `useACK=1`)
- Check the firehose settings in AWS. The listed HEC endpoint should have a valid SSL cert installed for the HEC port. Confirm the cert is valid by visiting `https://{{ endpoint }}:8088/services/collector/health`. If you do not get a security warning, SSL using a valid cert for HEC is correctly configured. Otherwise you need to use a valid cert or use an ELB intermediary to terminate SSL before forwarding to your HEC endpoint.
- Enable CloudWatch logs on each Kinesis Firehose Delivery stream
- In some cases, Trumpet will fail to deploy if AWS Config is misconfigured. Check that there are no iam permission/s3 bucket errors with your configuration recorder before deploying.
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

Trumpet is currently maintained by [nstonesplunk](https://github.com/nstonesplunk). This is not a Splunk supported solution.
