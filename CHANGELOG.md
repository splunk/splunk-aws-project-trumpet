### v0.3 - 04/02/2020

* Fixes for data sources with naming changes
* Python3.7 and nodejs12.x support. Thanks @dkujawski!
* README updates and fixes. Thanks @gliptak!
* Config function handles case where multiple regions share the same config bucket

### v0.2 - 06/19/2019

* Additional data sources have been added to the trumpet configuration tool. These include AWS VPC Flow logs, custom AWS CloudWatch Log groups, and **all** AWS data sources available through AWS CloudWatch Events (This includes AWS GuardDuty Findings, AWS Macie Alerts, AWS Health Events, etc.).
* For full functionality, trumpet now only requires two HTTP Event Collector (HEC) tokens to be created. One with indexer acknowledgement enabled, and one without (this token is only used if you choose to configure sending AWS Config data), all other token attributes (source, sourcetype, etc.) are not used and will be overridden.
* All data sources from AWS Kinesis Firehose will use the same HEC token when sending data to Splunk and send to the event endpoint. Sourcetype and other internal field assignment is set by a transforming function. Transforming Lambda functions for VPC Flow logs, CloudWatch logs, and CloudWatch Events have been added to this release to support this functionality.
* Automated HTTP Event Collector (HEC) token creation architecture has changed. This step has moved to the generated AWS CloudFormation template.
* Deployment instructions updated to recommend opening the static html/js webpage directly in a browser, rather than deploying an s3 backed website using a CloudFormation template. This option is still provided in the the trumpet-hosting directory.
* Alpha release Trumpet Splunk app included in the trumpet-hosting directory.
