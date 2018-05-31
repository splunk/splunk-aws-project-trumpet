import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Heading from '@splunk/react-ui/Heading';
import Menu from '@splunk/react-ui/Menu';
import P from '@splunk/react-ui/Paragraph';
import Button from '@splunk/react-ui/Button';
import { includes, without } from 'lodash';
import Switch from '@splunk/react-ui/Switch';
import { Splunk, Enterprise, Light, Cloud, Hunk } from '@splunk/react-ui/Logo'
import Text from '@splunk/react-ui/Text';
import css from './SplunkAwsConfigurationWebsite.css';
import ControlGroup from '@splunk/react-ui/ControlGroup';
import Multiselect from '@splunk/react-ui/Multiselect';

class SplunkAwsConfigurationWebsite extends Component {
    static propTypes = {
        name: PropTypes.string,
    };

    static defaultProps = {
        name: 'AWS to Splunk logging configuration',
    };

    constructor(props) {
        super(props);
        this.state = {
            items: [
                { id: 1, title: 'AWS Config Notifications', done: true, tokenValidity: 'valid', tokenValue: "", display: "inline", metricsDisplay: "none" },
                { id: 2, title: 'AWS Config Snapshots', done: true, tokenValidity: 'valid', tokenValue: "", display: "inline", metricsDisplay: "none" },
                { id: 3, title: 'AWS CloudTrail', done: true, tokenValidity: 'valid', tokenValue: "", display: "inline", metricsDisplay: "none" },
                { id: 4, title: 'AWS CloudWatch Metrics', done: true, tokenValidity: 'valid', tokenValue: "", display: "inline", metricsDisplay: "" }
            ],
            values: ["13"],
            EndpointValue: 'valid'
        };
    }

    render() {
        return (
            <div className={css.main}>
                <div className={css.header} style={{ display: 'flex', flexWrap: 'wrap', fontSize: '2.5em' }}>
                    <div style={{ "paddingLeft": "20px", "paddingTop": "3px", boxSizing: 'border-box' }}>
                        <Splunk invert />
                    </div>
                </div>
                <div className={css.container}>
                    <Heading level={1} style={{ "textAlign": 'center', "color": "#5cc05c" }}>{this.props.name}</Heading>
                    <br></br>
                    <P style={{ "width": "90%", "textAlign": 'center', "margin": "0 auto" }}>
                        Use the following form to create a unique CloudFormation template that will forward logs from your AWS environment to Splunk.
                        Once you have selected all your data sources, download the template and deploy the CloudFormation template using the AWS CLI or AWS CloudFormation console.
                    </P>
                    <br></br>
                    <P style={{ "width": "90%", "textAlign": 'center', "margin": "0 auto" }}>
                        <b>For each AWS service you select, you will need an enabled HEC token.</b>
                    </P>
                    <br></br>
                    <ControlGroup
                        label="Splunk endpoint URL"
                        labelPosition="top"
                        tooltip="Format is https://{{server}}:{{port}}/services/collector. The default port for HTTP Event Collector is 8088."
                        help="Example: https://1.1.1.1:8088/services/collector"
                        style={{ "margin": '0 auto' }}
                    >
                        <Text canClear onChange={this.handleEndpointChange} style={{ "width": "30%", "textAlign": 'center' }}/>
                    </ControlGroup>
                    <br></br>
                    <div style={{ "margin": "0 auto", "width": "650px" }}>
                        <Menu>
                            {this.state.items.map((item, index) =>
                                <Menu.Item
                                    selectable
                                    selected={item.done}
                                    key={item.id}
                                    style={{ "width": "650px", "margin": "0 auto", "float": "left"}}
                                >
                                    {item.title}
                                    <Switch
                                        key={item.id}
                                        value={item.title}
                                        onClick={() => this.handleClick(index)}
                                        selected={item.done}
                                        appearance="toggle"
                                        style={{ "float": "right", "marginTop": "-5px"}}
                                    ></Switch>
                                    <ControlGroup
                                        label="HTTP Event Collector Token"
                                        labelPosition="top"
                                        tooltip="Format is 12345678-qwer-asdf-zxcv-123456789qwe. Confirm that the token is enabled and assigned to the correct sourcetype."
                                        help="For example: 12345678-qwer-asdf-zxcv-123456789qwe"
                                        style={{ "float": "right", "marginTop": "-5px", "marginRight": "100px", "display": item.display }}
                                    >
                                        <Text inline onChange={(e) => this.handleTokenChange(index, e)} canClear/>
                                    </ControlGroup>
                                    <br style={{ "display": item.metricsDisplay }}></br>
                                    <br style={{ "display": item.metricsDisplay }}></br>
                                    <br style={{ "display": item.metricsDisplay }}></br>
                                    <br style={{ "display": item.metricsDisplay }}></br>
                                    <br style={{ "display": item.metricsDisplay }}></br>
                                    <P style={{ "display": item.metricsDisplay, "text-align": "center" }} >Select all AWS Metric Namespaces you would like to send to Splunk.</P>
                                    <Multiselect values={this.state.values} onChange={this.handleMultiSelectChange} style={{ "display": item.metricsDisplay }} inline>
                                        <Multiselect.Option label="AWS/ApiGateway" value="1" />
                                        <Multiselect.Option label="AWS/AppStream" value="2" />
                                        <Multiselect.Option label="AWS/AutoScaling" value="3" />
                                        <Multiselect.Option label="AWS/Billing" value="4" />
                                        <Multiselect.Option label="AWS/CloudFront" value="5" />
                                        <Multiselect.Option label="AWS/CloudSearch" value="6" />
                                        <Multiselect.Option label="AWS/Events" value="7" />
                                        <Multiselect.Option label="AWS/Logs" value="8" />
                                        <Multiselect.Option label="AWS/Connect" value="9" />
                                        <Multiselect.Option label="AWS/DMS" value="10" />
                                        <Multiselect.Option label="AWS/DX" value="11" />
                                        <Multiselect.Option label="AWS/DynamoDB" value="12" />
                                        <Multiselect.Option label="AWS/EC2" value="13" />
                                        <Multiselect.Option label="AWS/EC2Spot" value="14" />
                                        <Multiselect.Option label="AWS/ECS" value="15" />
                                        <Multiselect.Option label="AWS/ElasticBeanstalk" value="16" />
                                        <Multiselect.Option label="AWS/EBS" value="17" />
                                        <Multiselect.Option label="AWS/EFS" value="18" />
                                        <Multiselect.Option label="AWS/ELB" value="19" />
                                        <Multiselect.Option label="AWS/ApplicationELB" value="20" />
                                        <Multiselect.Option label="AWS/NetworkELB" value="21" />
                                        <Multiselect.Option label="AWS/ElasticTranscoder" value="22" />
                                        <Multiselect.Option label="AWS/ElastiCache" value="23" />
                                        <Multiselect.Option label="AWS/ES" value="24" />
                                        <Multiselect.Option label="AWS/ElasticMapReduce" value="25" />
                                        <Multiselect.Option label="AWS/GameLift" value="26" />
                                        <Multiselect.Option label="AWS/Inspector" value="27" />
                                        <Multiselect.Option label="AWS/IoT" value="28" />
                                        <Multiselect.Option label="AWS/KMS" value="29" />
                                        <Multiselect.Option label="AWS/KinesisAnalytics" value="30" />
                                        <Multiselect.Option label="AWS/Firehose" value="31" />
                                        <Multiselect.Option label="AWS/Kinesis" value="32" />
                                        <Multiselect.Option label="AWS/KinesisVideo" value="33" />
                                        <Multiselect.Option label="AWS/Lambda" value="34" />
                                        <Multiselect.Option label="AWS/Lex" value="35" />
                                        <Multiselect.Option label="AWS/ML" value="36" />
                                        <Multiselect.Option label="AWS/OpsWorks" value="37" />
                                        <Multiselect.Option label="AWS/Polly" value="38" />
                                        <Multiselect.Option label="AWS/Redshift" value="39" />
                                        <Multiselect.Option label="AWS/RDS" value="40" />
                                        <Multiselect.Option label="AWS/Route53" value="41" />
                                        <Multiselect.Option label="AWS/SageMaker" value="42" />
                                        <Multiselect.Option label="AWS/DDoSProtection" value="43" />
                                        <Multiselect.Option label="AWS/SES" value="44" />
                                        <Multiselect.Option label="AWS/SNS" value="45" />
                                        <Multiselect.Option label="AWS/SQS" value="46" />
                                        <Multiselect.Option label="AWS/S3" value="47" />
                                        <Multiselect.Option label="AWS/SWF" value="48" />
                                        <Multiselect.Option label="AWS/States" value="49" />
                                        <Multiselect.Option label="AWS/StorageGateway" value="50" />
                                        <Multiselect.Option label="AWS/Translate" value="51" />
                                        <Multiselect.Option label="AWS/NATGateway" value="52" />
                                        <Multiselect.Option label="AWS/VPN" value="53" />
                                        <Multiselect.Option label="AWS/WorkSpaces" value="54" />
                                    </Multiselect>
                                </Menu.Item>
                            )}
                            <br></br>
                        </Menu>
                    </div>
                    <br></br>
                    <Button label="Download CloudFormation template" onClick={() => this.handleDownloadClick()} appearance="primary" style={{ flexBasis: '200px' }} />
                </div>
            </div>
        );
    }

    handleMultiSelectChange = (e, { values }) => {
        this.setState({ values });
    };

    handleEndpointChange = (e, { value }) => {
        //this.setState({ value });
        this.state.EndpointValue = value;
    };

    handleTokenChange(index, event) {
        const items = this.state.items;
        //this.setState({value: event.target.value})
        items[index].tokenValue = event.target.value;
    };

    handleClick(index) {
        const items = this.state.items;
        items[index].done = !items[index].done;
        if (items[index].display == 'none') {
            items[index].display = "inline";
            if (items[index].title == "AWS CloudWatch Metrics") {
                items[index].metricsDisplay = ""
            }
        } else {
            items[index].display = "none";
            items[index].metricsDisplay = "none"
        }
        this.setState({ items });
    }

    handleDownloadClick() {
        var template = JSON.parse(
            '{\n' +
            '    "AWSTemplateFormatVersion": "2010-09-09", \n' +
            '    "Parameters": {\n' +
            '        "CloudWatchSplunkHttpEventCollectorToken": {\n' +
            '            "Type": "String", \n' +
            '            "Description": "The enabled HEC token on the Splunk environment for the aws:cloudwatch sourcetype. (format - 12345678-qwer-asdf-zxcv-123456789qwe)"\n' +
            '        }, \n' +
            '        "ConfigNotificationSplunkHttpEventCollectorToken": {\n' +
            '            "Type": "String", \n' +
            '            "Description": "The enabled HEC token on the Splunk environment for the aws:config:notification sourcetype. (format - 12345678-qwer-asdf-zxcv-123456789qwe)"\n' +
            '        }, \n' +
            '        "CloudTrailSplunkHttpEventCollectorToken": {\n' +
            '            "Type": "String", \n' +
            '            "Description": "The enabled HEC token on the Splunk environment for the aws:cloudtrail sourcetype. (format - 12345678-qwer-asdf-zxcv-123456789qwe)"\n' +
            '        }, \n' +
            '        "SplunkHttpEventCollectorURL": {\n' +
            '            "Type": "String", \n' +
            '            "Description": "The HEC endpoint server and port (default 8088) of the the Splunk environment which will receive AWS data. (format - https://server:port/services/collector)"\n' +
            '        }, \n' +
            '        "ConfigSplunkHttpEventCollectorToken": {\n' +
            '            "Type": "String", \n' +
            '            "Description": "The enabled HEC token on the Splunk environment for the aws:config sourcetype. (format - 12345678-qwer-asdf-zxcv-123456789qwe)"\n' +
            '        }\n' +
            '    }, \n' +
            '    "Description": "Template for AWS data ingest into Splunk using firehose", \n' +
            '    "Resources": {\n' +
            '        "ConfigurationRecorderSanitizationLambdaExecutionRole": {\n' +
            '            "Type": "AWS::IAM::Role", \n' +
            '            "Properties": {\n' +
            '                "Path": "/", \n' +
            '                "Policies": [\n' +
            '                    {\n' +
            '                        "PolicyName": "root", \n' +
            '                        "PolicyDocument": {\n' +
            '                            "Version": "2012-10-17", \n' +
            '                            "Statement": [\n' +
            '                                {\n' +
            '                                    "Action": [\n' +
            '                                        "iam:PassRole"\n' +
            '                                    ], \n' +
            '                                    "Resource": [\n' +
            '                                        {\n' +
            '                                            "Fn::GetAtt": [\n' +
            '                                                "BackingLambdaExecutionConfigLogProcessor", \n' +
            '                                                "Arn"\n' +
            '                                            ]\n' +
            '                                        }\n' +
            '                                    ], \n' +
            '                                    "Effect": "Allow"\n' +
            '                                }, \n' +
            '                                {\n' +
            '                                    "Action": [\n' +
            '                                        "logs:CreateLogGroup", \n' +
            '                                        "logs:CreateLogStream", \n' +
            '                                        "logs:PutLogEvents"\n' +
            '                                    ], \n' +
            '                                    "Resource": "arn:aws:logs:*:*:*", \n' +
            '                                    "Effect": "Allow"\n' +
            '                                }, \n' +
            '                                {\n' +
            '                                    "Action": [\n' +
            '                                        "config:DescribeConfigurationRecorders", \n' +
            '                                        "config:DescribeDeliveryChannels", \n' +
            '                                        "config:PutConfigurationRecorder", \n' +
            '                                        "config:StartConfigurationRecorder", \n' +
            '                                        "config:PutDeliveryChannel", \n' +
            '                                        "config:DescribeConfigurationRecorderStatus", \n' +
            '                                        "config:DeleteConfigurationRecorder", \n' +
            '                                        "config:DeleteDeliveryChannel"\n' +
            '                                    ], \n' +
            '                                    "Resource": [\n' +
            '                                        "*"\n' +
            '                                    ], \n' +
            '                                    "Effect": "Allow"\n' +
            '                                }, \n' +
            '                                {\n' +
            '                                    "Action": [\n' +
            '                                        "iam:PassRole"\n' +
            '                                    ], \n' +
            '                                    "Resource": [\n' +
            '                                        {\n' +
            '                                            "Fn::GetAtt": [\n' +
            '                                                "ConfigRole", \n' +
            '                                                "Arn"\n' +
            '                                            ]\n' +
            '                                        }\n' +
            '                                    ], \n' +
            '                                    "Effect": "Allow"\n' +
            '                                }\n' +
            '                            ]\n' +
            '                        }\n' +
            '                    }\n' +
            '                ], \n' +
            '                "AssumeRolePolicyDocument": {\n' +
            '                    "Version": "2012-10-17", \n' +
            '                    "Statement": [\n' +
            '                        {\n' +
            '                            "Action": [\n' +
            '                                "sts:AssumeRole"\n' +
            '                            ], \n' +
            '                            "Effect": "Allow", \n' +
            '                            "Principal": {\n' +
            '                                "Service": [\n' +
            '                                    "lambda.amazonaws.com"\n' +
            '                                ]\n' +
            '                            }\n' +
            '                        }\n' +
            '                    ]\n' +
            '                }\n' +
            '            }\n' +
            '        }, \n' +
            '        "ConfigBucketPermission": {\n' +
            '            "Type": "AWS::Lambda::Permission", \n' +
            '            "Properties": {\n' +
            '                "Action": "lambda:InvokeFunction", \n' +
            '                "SourceAccount": {\n' +
            '                    "Ref": "AWS::AccountId"\n' +
            '                }, \n' +
            '                "Principal": "s3.amazonaws.com", \n' +
            '                "FunctionName": {\n' +
            '                    "Ref": "BackingLambdaConfigLogProcessor"\n' +
            '                }, \n' +
            '                "SourceArn": {\n' +
            '                    "Fn::GetAtt": [\n' +
            '                        "ConfigurationRecorderSanitisationResults", \n' +
            '                        "FinalS3BucketConfigArn"\n' +
            '                    ]\n' +
            '                }\n' +
            '            }\n' +
            '        }, \n' +
            '        "BackingLambdaConfigLogProcessor": {\n' +
            '            "Type": "AWS::Lambda::Function", \n' +
            '            "Properties": {\n' +
            '                "Code": {\n' +
            '                    "S3Bucket": "nstone-website-test", \n' +
            '                    "S3Key": "9423afda8ce763536973670632a4f3e1"\n' +
            '                }, \n' +
            '                "Description": "Stream events from an AWS S3 bucket being updated by AWS config to Splunk using HTTP event collector", \n' +
            '                "MemorySize": 512, \n' +
            '                "Environment": {\n' +
            '                    "Variables": {\n' +
            '                        "SPLUNK_HEC_URL": {\n' +
            '                            "Ref": "SplunkHttpEventCollectorURL"\n' +
            '                        }, \n' +
            '                        "SPLUNK_HEC_TOKEN": {\n' +
            '                            "Ref": "ConfigSplunkHttpEventCollectorToken"\n' +
            '                        }\n' +
            '                    }\n' +
            '                }, \n' +
            '                "Handler": "index.handler", \n' +
            '                "Role": {\n' +
            '                    "Fn::GetAtt": [\n' +
            '                        "BackingLambdaExecutionConfigLogProcessorRole", \n' +
            '                        "Arn"\n' +
            '                    ]\n' +
            '                }, \n' +
            '                "Timeout": 300, \n' +
            '                "Runtime": "nodejs6.10"\n' +
            '            }\n' +
            '        }, \n' +
            '        "BackingLambdaCloudWatchMetricsProcessor": {\n' +
            '            "Type": "AWS::Lambda::Function", \n' +
            '            "Properties": {\n' +
            '                "Code": {\n' +
            '                    "S3Bucket": "nstone-website-test", \n' +
            '                    "S3Key": "585d4f013252c70f1807fef4f463aea8"\n' +
            '                }, \n' +
            '                "Description": "Send CloudWatch Metrics to Splunk using HTTP event collector", \n' +
            '                "MemorySize": 512, \n' +
            '                "Environment": {\n' +
            '                    "Variables": {\n' +
            '                        "SPLUNK_HEC_URL": {\n' +
            '                            "Ref": "SplunkHttpEventCollectorURL"\n' +
            '                        }, \n' +
            '                        "SPLUNK_HEC_TOKEN": {\n' +
            '                            "Ref": "CloudWatchSplunkHttpEventCollectorToken"\n' +
            '                        }\n' +
            '                    }\n' +
            '                }, \n' +
            '                "Handler": "index.handler", \n' +
            '                "Role": {\n' +
            '                    "Fn::GetAtt": [\n' +
            '                        "BackingLambdaExecutionRoleCloudWatchMetricsProcessor", \n' +
            '                        "Arn"\n' +
            '                    ]\n' +
            '                }, \n' +
            '                "Timeout": 300, \n' +
            '                "Runtime": "nodejs6.10"\n' +
            '            }\n' +
            '        }, \n' +
            '        "ConfigurationRecorderLambdaExecutionRole": {\n' +
            '            "Type": "AWS::IAM::Role", \n' +
            '            "Properties": {\n' +
            '                "Path": "/", \n' +
            '                "ManagedPolicyArns": [\n' +
            '                    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"\n' +
            '                ], \n' +
            '                "Policies": [\n' +
            '                    {\n' +
            '                        "PolicyName": "ConfigLambdaExecutionRolePolicy", \n' +
            '                        "PolicyDocument": {\n' +
            '                            "Version": "2012-10-17", \n' +
            '                            "Statement": [\n' +
            '                                {\n' +
            '                                    "Action": [\n' +
            '                                        "s3:PutObject", \n' +
            '                                        "s3:DeleteObject", \n' +
            '                                        "s3:GetBucketPolicy", \n' +
            '                                        "s3:PutBucketNotification"\n' +
            '                                    ], \n' +
            '                                    "Resource": {\n' +
            '                                        "Fn::GetAtt": [\n' +
            '                                            "ConfigurationRecorderSanitisationResults", \n' +
            '                                            "FinalS3BucketConfigArn"\n' +
            '                                        ]\n' +
            '                                    }, \n' +
            '                                    "Effect": "Allow"\n' +
            '                                }\n' +
            '                            ]\n' +
            '                        }\n' +
            '                    }\n' +
            '                ], \n' +
            '                "AssumeRolePolicyDocument": {\n' +
            '                    "Version": "2012-10-17", \n' +
            '                    "Statement": [\n' +
            '                        {\n' +
            '                            "Action": [\n' +
            '                                "sts:AssumeRole"\n' +
            '                            ], \n' +
            '                            "Effect": "Allow", \n' +
            '                            "Principal": {\n' +
            '                                "Service": [\n' +
            '                                    "lambda.amazonaws.com"\n' +
            '                                ]\n' +
            '                            }\n' +
            '                        }\n' +
            '                    ]\n' +
            '                }\n' +
            '            }\n' +
            '        }, \n' +
            '        "ConfigNotificationBackupS3Bucket": {\n' +
            '            "Type": "AWS::S3::Bucket", \n' +
            '            "Properties": {\n' +
            '                "VersioningConfiguration": {\n' +
            '                    "Status": "Enabled"\n' +
            '                }\n' +
            '            }\n' +
            '        }, \n' +
            '        "CloudTrailEventRule": {\n' +
            '            "Type": "AWS::Events::Rule", \n' +
            '            "Properties": {\n' +
            '                "EventPattern": {\n' +
            '                    "source": [\n' +
            '                        "aws.cloudtrail"\n' +
            '                    ]\n' +
            '                }, \n' +
            '                "State": "ENABLED", \n' +
            '                "Targets": [\n' +
            '                    {\n' +
            '                        "RoleArn": {\n' +
            '                            "Fn::GetAtt": [\n' +
            '                                "CloudTrailFirehoseDeliveryRole", \n' +
            '                                "Arn"\n' +
            '                            ]\n' +
            '                        }, \n' +
            '                        "Id": "splunk_cloudtrail_firehose_target", \n' +
            '                        "Arn": "arn:aws:firehose:us-west-2:112543817624:deliverystream/splunk-cloudtrail-cwe-monitoring"\n' +
            '                    }\n' +
            '                ]\n' +
            '            }\n' +
            '        }, \n' +
            '        "CloudTrailBackupS3Bucket": {\n' +
            '            "Type": "AWS::S3::Bucket", \n' +
            '            "Properties": {\n' +
            '                "VersioningConfiguration": {\n' +
            '                    "Status": "Enabled"\n' +
            '                }\n' +
            '            }\n' +
            '        }, \n' +
            '        "BackingLambdaExecutionRoleCloudWatchMetricsProcessor": {\n' +
            '            "Type": "AWS::IAM::Role", \n' +
            '            "Properties": {\n' +
            '                "Path": "/", \n' +
            '                "ManagedPolicyArns": [\n' +
            '                    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"\n' +
            '                ], \n' +
            '                "Policies": [\n' +
            '                    {\n' +
            '                        "PolicyName": "BackingLambdaExecutionCloudWatchMetricsPolicy", \n' +
            '                        "PolicyDocument": {\n' +
            '                            "Version": "2012-10-17", \n' +
            '                            "Statement": [\n' +
            '                                {\n' +
            '                                    "Action": [\n' +
            '                                        "logs:CreateLogGroup", \n' +
            '                                        "logs:CreateLogStream", \n' +
            '                                        "logs:PutLogEvents"\n' +
            '                                    ], \n' +
            '                                    "Resource": [\n' +
            '                                        "arn:aws:logs:*:*:*"\n' +
            '                                    ], \n' +
            '                                    "Effect": "Allow"\n' +
            '                                }, \n' +
            '                                {\n' +
            '                                    "Action": [\n' +
            '                                        "lambda:UpdateFunctionConfiguration"\n' +
            '                                    ], \n' +
            '                                    "Resource": [\n' +
            '                                        "*"\n' +
            '                                    ], \n' +
            '                                    "Effect": "Allow"\n' +
            '                                }, \n' +
            '                                {\n' +
            '                                    "Action": [\n' +
            '                                        "cloudwatch:GetMetricStatistics", \n' +
            '                                        "cloudwatch:ListMetrics"\n' +
            '                                    ], \n' +
            '                                    "Resource": [\n' +
            '                                        "*"\n' +
            '                                    ], \n' +
            '                                    "Effect": "Allow"\n' +
            '                                }, \n' +
            '                                {\n' +
            '                                    "Action": [\n' +
            '                                        "dynamodb:GetItem", \n' +
            '                                        "dynamodb:UpdateItem"\n' +
            '                                    ], \n' +
            '                                    "Resource": [\n' +
            '                                        "*"\n' +
            '                                    ], \n' +
            '                                    "Effect": "Allow"\n' +
            '                                }\n' +
            '                            ]\n' +
            '                        }\n' +
            '                    }\n' +
            '                ], \n' +
            '                "AssumeRolePolicyDocument": {\n' +
            '                    "Version": "2012-10-17", \n' +
            '                    "Statement": [\n' +
            '                        {\n' +
            '                            "Action": [\n' +
            '                                "sts:AssumeRole"\n' +
            '                            ], \n' +
            '                            "Effect": "Allow", \n' +
            '                            "Principal": {\n' +
            '                                "Service": [\n' +
            '                                    "lambda.amazonaws.com"\n' +
            '                                ]\n' +
            '                            }\n' +
            '                        }\n' +
            '                    ]\n' +
            '                }\n' +
            '            }\n' +
            '        }, \n' +
            '        "ConfigBucketConfiguration": {\n' +
            '            "Type": "Custom::S3ConfigBucketConfiguration", \n' +
            '            "Properties": {\n' +
            '                "ServiceToken": {\n' +
            '                    "Fn::GetAtt": [\n' +
            '                        "ConfigUpdateBucketConfiguration", \n' +
            '                        "Arn"\n' +
            '                    ]\n' +
            '                }, \n' +
            '                "Bucket": {\n' +
            '                    "Fn::GetAtt": [\n' +
            '                        "ConfigurationRecorderSanitisationResults", \n' +
            '                        "FinalS3BucketConfig"\n' +
            '                    ]\n' +
            '                }, \n' +
            '                "NotificationConfiguration": {\n' +
            '                    "LambdaFunctionConfigurations": [\n' +
            '                        {\n' +
            '                            "LambdaFunctionArn": {\n' +
            '                                "Fn::GetAtt": [\n' +
            '                                    "BackingLambdaConfigLogProcessor", \n' +
            '                                    "Arn"\n' +
            '                                ]\n' +
            '                            }, \n' +
            '                            "Events": [\n' +
            '                                "s3:ObjectCreated:*"\n' +
            '                            ]\n' +
            '                        }\n' +
            '                    ]\n' +
            '                }\n' +
            '            }, \n' +
            '            "DependsOn": [\n' +
            '                "ConfigBucketPermission"\n' +
            '            ]\n' +
            '        }, \n' +
            '        "ConfigurationRecorderSanitiser": {\n' +
            '            "Type": "AWS::Lambda::Function", \n' +
            '            "Properties": {\n' +
            '                "Code": {\n' +
            '                    "S3Bucket": "nstone-website-test", \n' +
            '                    "S3Key": "fafc41278e282521cbb4ac9f920bcb45"\n' +
            '                }, \n' +
            '                "Runtime": "nodejs6.10", \n' +
            '                "Handler": "index.handler", \n' +
            '                "Role": {\n' +
            '                    "Fn::GetAtt": [\n' +
            '                        "ConfigurationRecorderSanitizationLambdaExecutionRole", \n' +
            '                        "Arn"\n' +
            '                    ]\n' +
            '                }, \n' +
            '                "Timeout": 300\n' +
            '            }\n' +
            '        }, \n' +
            '        "EventRule": {\n' +
            '            "Type": "AWS::Events::Rule", \n' +
            '            "Properties": {\n' +
            '                "State": "ENABLED", \n' +
            '                "ScheduleExpression": "cron(4,9,14,19,24,29,34,39,44,49,54,59 * * * ? *)", \n' +
            '                "Description": "EventRule", \n' +
            '                "Targets": [\n' +
            '                    {\n' +
            '                        "Id": "TargetFunctionMetricsPoller", \n' +
            '                        "Arn": {\n' +
            '                            "Fn::GetAtt": [\n' +
            '                                "BackingLambdaCloudWatchMetricsProcessor", \n' +
            '                                "Arn"\n' +
            '                            ]\n' +
            '                        }\n' +
            '                    }\n' +
            '                ]\n' +
            '            }\n' +
            '        }, \n' +
            '        "CloudTrailFirehoseDeliveryPolicy": {\n' +
            '            "Type": "AWS::IAM::Policy", \n' +
            '            "Properties": {\n' +
            '                "PolicyName": "firehose_delivery_policy", \n' +
            '                "PolicyDocument": {\n' +
            '                    "Version": "2012-10-17", \n' +
            '                    "Statement": [\n' +
            '                        {\n' +
            '                            "Action": [\n' +
            '                                "firehose:PutRecord", \n' +
            '                                "firehose:PutRecordBatch"\n' +
            '                            ], \n' +
            '                            "Resource": [\n' +
            '                                "arn:aws:firehose:us-west-2:112543817624:deliverystream/splunk-cloudtrail-cwe-monitoring"\n' +
            '                            ], \n' +
            '                            "Effect": "Allow"\n' +
            '                        }\n' +
            '                    ]\n' +
            '                }, \n' +
            '                "Roles": [\n' +
            '                    {\n' +
            '                        "Ref": "CloudTrailFirehoseDeliveryRole"\n' +
            '                    }\n' +
            '                ]\n' +
            '            }\n' +
            '        }, \n' +
            '        "ConfigNotificationFirehoseDeliveryPolicy": {\n' +
            '            "Type": "AWS::IAM::Policy", \n' +
            '            "Properties": {\n' +
            '                "PolicyName": "firehose_delivery_policy", \n' +
            '                "PolicyDocument": {\n' +
            '                    "Version": "2012-10-17", \n' +
            '                    "Statement": [\n' +
            '                        {\n' +
            '                            "Action": [\n' +
            '                                "firehose:PutRecord", \n' +
            '                                "firehose:PutRecordBatch"\n' +
            '                            ], \n' +
            '                            "Resource": [\n' +
            '                                "arn:aws:firehose:us-west-2:112543817624:deliverystream/splunk-config-notification-cwe-monitoring"\n' +
            '                            ], \n' +
            '                            "Effect": "Allow"\n' +
            '                        }\n' +
            '                    ]\n' +
            '                }, \n' +
            '                "Roles": [\n' +
            '                    {\n' +
            '                        "Ref": "ConfigNotificationFirehoseDeliveryRole"\n' +
            '                    }\n' +
            '                ]\n' +
            '            }\n' +
            '        }, \n' +
            '        "ConfigNotificationFirehoseDeliveryStream": {\n' +
            '            "Type": "AWS::KinesisFirehose::DeliveryStream", \n' +
            '            "Properties": {\n' +
            '                "SplunkDestinationConfiguration": {\n' +
            '                    "S3Configuration": {\n' +
            '                        "CompressionFormat": "UNCOMPRESSED", \n' +
            '                        "BucketARN": {\n' +
            '                            "Fn::GetAtt": [\n' +
            '                                "ConfigNotificationBackupS3Bucket", \n' +
            '                                "Arn"\n' +
            '                            ]\n' +
            '                        }, \n' +
            '                        "RoleARN": {\n' +
            '                            "Fn::GetAtt": [\n' +
            '                                "ConfigNotificationBackupS3Role", \n' +
            '                                "Arn"\n' +
            '                            ]\n' +
            '                        }, \n' +
            '                        "BufferingHints": {\n' +
            '                            "IntervalInSeconds": 300, \n' +
            '                            "SizeInMBs": 5\n' +
            '                        }\n' +
            '                    }, \n' +
            '                    "HECEndpointType": "Raw", \n' +
            '                    "HECToken": "SPLUNK_HEC_TOKEN", \n' +
            '                    "HECAcknowledgmentTimeoutInSeconds": 180, \n' +
            '                    "RetryOptions": {\n' +
            '                        "DurationInSeconds": 300\n' +
            '                    }, \n' +
            '                    "HECEndpoint": "SPLUNK_HEC_URL", \n' +
            '                    "S3BackupMode": "FailedEventsOnly", \n' +
            '                    "ProcessingConfiguration": {\n' +
            '                        "Enabled": false\n' +
            '                    }\n' +
            '                }, \n' +
            '                "DeliveryStreamType": "DirectPut", \n' +
            '                "DeliveryStreamName": "splunk-config-notification-cwe-monitoring"\n' +
            '            }\n' +
            '        }, \n' +
            '        "PermissionForEventsToInvokeLambda": {\n' +
            '            "Type": "AWS::Lambda::Permission", \n' +
            '            "Properties": {\n' +
            '                "Action": "lambda:InvokeFunction", \n' +
            '                "Principal": "events.amazonaws.com", \n' +
            '                "FunctionName": {\n' +
            '                    "Ref": "BackingLambdaCloudWatchMetricsProcessor"\n' +
            '                }, \n' +
            '                "SourceArn": {\n' +
            '                    "Fn::GetAtt": [\n' +
            '                        "EventRule", \n' +
            '                        "Arn"\n' +
            '                    ]\n' +
            '                }\n' +
            '            }\n' +
            '        }, \n' +
            '        "BackingLambdaExecutionConfigLogProcessor": {\n' +
            '            "Type": "AWS::IAM::Role", \n' +
            '            "Properties": {\n' +
            '                "Path": "/", \n' +
            '                "ManagedPolicyArns": [\n' +
            '                    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"\n' +
            '                ], \n' +
            '                "Policies": [\n' +
            '                    {\n' +
            '                        "PolicyName": "BackingLambdaExecutionCloudTrailLogProcessorPolicy", \n' +
            '                        "PolicyDocument": {\n' +
            '                            "Version": "2012-10-17", \n' +
            '                            "Statement": [\n' +
            '                                {\n' +
            '                                    "Action": [\n' +
            '                                        "s3:getObject", \n' +
            '                                        "s3:putObject", \n' +
            '                                        "s3:ListBucket"\n' +
            '                                    ], \n' +
            '                                    "Resource": {\n' +
            '                                        "Fn::Join": [\n' +
            '                                            "", \n' +
            '                                            [\n' +
            '                                                "arn:aws:s3:::", \n' +
            '                                                {\n' +
            '                                                    "Ref": "S3BucketConfig"\n' +
            '                                                }, \n' +
            '                                                "/*"\n' +
            '                                            ]\n' +
            '                                        ]\n' +
            '                                    }, \n' +
            '                                    "Effect": "Allow"\n' +
            '                                }\n' +
            '                            ]\n' +
            '                        }\n' +
            '                    }\n' +
            '                ], \n' +
            '                "AssumeRolePolicyDocument": {\n' +
            '                    "Version": "2012-10-17", \n' +
            '                    "Statement": [\n' +
            '                        {\n' +
            '                            "Action": [\n' +
            '                                "sts:AssumeRole"\n' +
            '                            ], \n' +
            '                            "Effect": "Allow", \n' +
            '                            "Principal": {\n' +
            '                                "Service": [\n' +
            '                                    "lambda.amazonaws.com"\n' +
            '                                ]\n' +
            '                            }\n' +
            '                        }\n' +
            '                    ]\n' +
            '                }\n' +
            '            }\n' +
            '        }, \n' +
            '        "ConfigUpdateBucketConfiguration": {\n' +
            '            "Type": "AWS::Lambda::Function", \n' +
            '            "Properties": {\n' +
            '                "Code": {\n' +
            '                    "ZipFile": {\n' +
            '                        "Fn::Sub": "var response = require(\'cfn-response\');\\nvar AWS = require(\'aws-sdk\');\\nvar s3 = new AWS.S3();\\nexports.handler = function(event, context) {\\n  var respond = (e) => response.send(event, context, e ? response.FAILED : response.SUCCESS, e ? e : {});\\n  var params = event.ResourceProperties;\\n  delete params.ServiceToken;\\n  if (event.RequestType === \'Delete\') {\\n    params.NotificationConfiguration = {};\\n    s3.putBucketNotificationConfiguration(params).promise()\\n      .then((data)=>respond())\\n      .catch((e)=>respond());\\n  } else {\\n    s3.putBucketNotificationConfiguration(params).promise()\\n      .then((data)=>respond())\\n      .catch((e)=>respond(e));\\n  }\\n};\\n"\n' +
            '                    }\n' +
            '                }, \n' +
            '                "Role": {\n' +
            '                    "Fn::GetAtt": [\n' +
            '                        "ConfigurationRecorderLambdaExecutionRole", \n' +
            '                        "Arn"\n' +
            '                    ]\n' +
            '                }, \n' +
            '                "Description": "S3 Object Custom Resource", \n' +
            '                "Timeout": 300, \n' +
            '                "Handler": "index.handler", \n' +
            '                "Runtime": "nodejs6.10"\n' +
            '            }\n' +
            '        }, \n' +
            '        "S3BucketConfig": {\n' +
            '            "Type": "AWS::S3::Bucket", \n' +
            '            "Properties": {\n' +
            '                "VersioningConfiguration": {\n' +
            '                    "Status": "Enabled"\n' +
            '                }\n' +
            '            }\n' +
            '        }, \n' +
            '        "ConfigurationRecorderSanitisationResults": {\n' +
            '            "Type": "Custom::ConfigurationRecorderSanitisationResults", \n' +
            '            "Properties": {\n' +
            '                "S3BucketConfig": {\n' +
            '                    "Ref": "S3BucketConfig"\n' +
            '                }, \n' +
            '                "RoleARN": {\n' +
            '                    "Fn::GetAtt": [\n' +
            '                        "BackingLambdaExecutionConfigLogProcessor", \n' +
            '                        "Arn"\n' +
            '                    ]\n' +
            '                }, \n' +
            '                "ConfigRecorderName": "ConfigRecorder", \n' +
            '                "ServiceToken": {\n' +
            '                    "Fn::GetAtt": [\n' +
            '                        "ConfigurationRecorderSanitiser", \n' +
            '                        "Arn"\n' +
            '                    ]\n' +
            '                }, \n' +
            '                "S3BucketConfigArn": {\n' +
            '                    "Fn::GetAtt": [\n' +
            '                        "S3BucketConfig", \n' +
            '                        "Arn"\n' +
            '                    ]\n' +
            '                }, \n' +
            '                "RecorderRoleArn": {\n' +
            '                    "Fn::GetAtt": [\n' +
            '                        "ConfigRole", \n' +
            '                        "Arn"\n' +
            '                    ]\n' +
            '                }\n' +
            '            }\n' +
            '        }, \n' +
            '        "ConfigNotificationEventRule": {\n' +
            '            "Type": "AWS::Events::Rule", \n' +
            '            "Properties": {\n' +
            '                "EventPattern": {\n' +
            '                    "source": [\n' +
            '                        "aws.config"\n' +
            '                    ], \n' +
            '                    "detail-type": [\n' +
            '                        "Config Configuration Item Change"\n' +
            '                    ]\n' +
            '                }, \n' +
            '                "State": "ENABLED", \n' +
            '                "Targets": [\n' +
            '                    {\n' +
            '                        "RoleArn": {\n' +
            '                            "Fn::GetAtt": [\n' +
            '                                "ConfigNotificationFirehoseDeliveryRole", \n' +
            '                                "Arn"\n' +
            '                            ]\n' +
            '                        }, \n' +
            '                        "Id": "splunk_config_notification_firehose_target", \n' +
            '                        "Arn": "arn:aws:firehose:us-west-2:112543817624:deliverystream/splunk-config-notification-cwe-monitoring"\n' +
            '                    }\n' +
            '                ]\n' +
            '            }\n' +
            '        }, \n' +
            '        "CloudTrailFirehoseDeliveryRole": {\n' +
            '            "Type": "AWS::IAM::Role", \n' +
            '            "Properties": {\n' +
            '                "AssumeRolePolicyDocument": {\n' +
            '                    "Version": "2012-10-17", \n' +
            '                    "Statement": [\n' +
            '                        {\n' +
            '                            "Action": "sts:AssumeRole", \n' +
            '                            "Sid": "", \n' +
            '                            "Effect": "Allow", \n' +
            '                            "Principal": {\n' +
            '                                "Service": "events.amazonaws.com"\n' +
            '                            }\n' +
            '                        }\n' +
            '                    ]\n' +
            '                }\n' +
            '            }\n' +
            '        }, \n' +
            '        "CloudTrailBackupS3Role": {\n' +
            '            "Type": "AWS::IAM::Role", \n' +
            '            "Properties": {\n' +
            '                "Path": "/", \n' +
            '                "Policies": [\n' +
            '                    {\n' +
            '                        "PolicyName": "root", \n' +
            '                        "PolicyDocument": {\n' +
            '                            "Version": "2012-10-17", \n' +
            '                            "Statement": [\n' +
            '                                {\n' +
            '                                    "Action": [\n' +
            '                                        "s3:AbortMultipartUpload", \n' +
            '                                        "s3:GetBucketLocation", \n' +
            '                                        "s3:GetObject", \n' +
            '                                        "s3:ListBucket", \n' +
            '                                        "s3:ListBucketMultipartUploads", \n' +
            '                                        "s3:PutObject"\n' +
            '                                    ], \n' +
            '                                    "Resource": [\n' +
            '                                        {\n' +
            '                                            "Fn::GetAtt": [\n' +
            '                                                "CloudTrailBackupS3Bucket", \n' +
            '                                                "Arn"\n' +
            '                                            ]\n' +
            '                                        }\n' +
            '                                    ], \n' +
            '                                    "Effect": "Allow"\n' +
            '                                }, \n' +
            '                                {\n' +
            '                                    "Action": [\n' +
            '                                        "logs:CreateLogGroup", \n' +
            '                                        "logs:CreateLogStream", \n' +
            '                                        "logs:PutLogEvents"\n' +
            '                                    ], \n' +
            '                                    "Resource": "*", \n' +
            '                                    "Effect": "Allow"\n' +
            '                                }\n' +
            '                            ]\n' +
            '                        }\n' +
            '                    }\n' +
            '                ], \n' +
            '                "AssumeRolePolicyDocument": {\n' +
            '                    "Version": "2012-10-17", \n' +
            '                    "Statement": [\n' +
            '                        {\n' +
            '                            "Action": "sts:AssumeRole", \n' +
            '                            "Sid": "", \n' +
            '                            "Effect": "Allow", \n' +
            '                            "Principal": {\n' +
            '                                "Service": "firehose.amazonaws.com"\n' +
            '                            }\n' +
            '                        }\n' +
            '                    ]\n' +
            '                }\n' +
            '            }\n' +
            '        }, \n' +
            '        "CloudTrailFirehoseDeliveryStream": {\n' +
            '            "Type": "AWS::KinesisFirehose::DeliveryStream", \n' +
            '            "Properties": {\n' +
            '                "SplunkDestinationConfiguration": {\n' +
            '                    "S3Configuration": {\n' +
            '                        "CompressionFormat": "UNCOMPRESSED", \n' +
            '                        "BucketARN": {\n' +
            '                            "Fn::GetAtt": [\n' +
            '                                "CloudTrailBackupS3Bucket", \n' +
            '                                "Arn"\n' +
            '                            ]\n' +
            '                        }, \n' +
            '                        "RoleARN": {\n' +
            '                            "Fn::GetAtt": [\n' +
            '                                "CloudTrailBackupS3Role", \n' +
            '                                "Arn"\n' +
            '                            ]\n' +
            '                        }, \n' +
            '                        "BufferingHints": {\n' +
            '                            "IntervalInSeconds": 300, \n' +
            '                            "SizeInMBs": 5\n' +
            '                        }\n' +
            '                    }, \n' +
            '                    "HECEndpointType": "Raw", \n' +
            '                    "HECToken": "SPLUNK_HEC_TOKEN", \n' +
            '                    "HECAcknowledgmentTimeoutInSeconds": 180, \n' +
            '                    "RetryOptions": {\n' +
            '                        "DurationInSeconds": 300\n' +
            '                    }, \n' +
            '                    "HECEndpoint": "SPLUNK_HEC_URL", \n' +
            '                    "S3BackupMode": "FailedEventsOnly", \n' +
            '                    "ProcessingConfiguration": {\n' +
            '                        "Enabled": false\n' +
            '                    }\n' +
            '                }, \n' +
            '                "DeliveryStreamType": "DirectPut", \n' +
            '                "DeliveryStreamName": "splunk-cloudtrail-cwe-monitoring"\n' +
            '            }\n' +
            '        }, \n' +
            '        "ConfigRole": {\n' +
            '            "Type": "AWS::IAM::Role", \n' +
            '            "Properties": {\n' +
            '                "ManagedPolicyArns": [\n' +
            '                    "arn:aws:iam::aws:policy/service-role/AWSConfigRole"\n' +
            '                ], \n' +
            '                "Policies": [\n' +
            '                    {\n' +
            '                        "PolicyName": "ConfigRolePolicy", \n' +
            '                        "PolicyDocument": {\n' +
            '                            "Version": "2012-10-17", \n' +
            '                            "Statement": [\n' +
            '                                {\n' +
            '                                    "Action": [\n' +
            '                                        "s3:PutObject"\n' +
            '                                    ], \n' +
            '                                    "Resource": {\n' +
            '                                        "Fn::Join": [\n' +
            '                                            "", \n' +
            '                                            [\n' +
            '                                                "arn:aws:s3:::", \n' +
            '                                                {\n' +
            '                                                    "Ref": "S3BucketConfig"\n' +
            '                                                }, \n' +
            '                                                "/AWSLogs/", \n' +
            '                                                {\n' +
            '                                                    "Ref": "AWS::AccountId"\n' +
            '                                                }, \n' +
            '                                                "/*"\n' +
            '                                            ]\n' +
            '                                        ]\n' +
            '                                    }, \n' +
            '                                    "Effect": "Allow", \n' +
            '                                    "Condition": {\n' +
            '                                        "StringLike": {\n' +
            '                                            "s3:x-amz-acl": "bucket-owner-full-control"\n' +
            '                                        }\n' +
            '                                    }\n' +
            '                                }, \n' +
            '                                {\n' +
            '                                    "Action": "config:Put*", \n' +
            '                                    "Resource": "*", \n' +
            '                                    "Effect": "Allow"\n' +
            '                                }, \n' +
            '                                {\n' +
            '                                    "Action": [\n' +
            '                                        "s3:GetBucketAcl"\n' +
            '                                    ], \n' +
            '                                    "Resource": {\n' +
            '                                        "Fn::Join": [\n' +
            '                                            "", \n' +
            '                                            [\n' +
            '                                                "arn:aws:s3:::", \n' +
            '                                                {\n' +
            '                                                    "Ref": "S3BucketConfig"\n' +
            '                                                }\n' +
            '                                            ]\n' +
            '                                        ]\n' +
            '                                    }, \n' +
            '                                    "Effect": "Allow"\n' +
            '                                }\n' +
            '                            ]\n' +
            '                        }\n' +
            '                    }\n' +
            '                ], \n' +
            '                "AssumeRolePolicyDocument": {\n' +
            '                    "Version": "2012-10-17", \n' +
            '                    "Statement": [\n' +
            '                        {\n' +
            '                            "Action": "sts:AssumeRole", \n' +
            '                            "Sid": "", \n' +
            '                            "Effect": "Allow", \n' +
            '                            "Principal": {\n' +
            '                                "Service": "config.amazonaws.com"\n' +
            '                            }\n' +
            '                        }\n' +
            '                    ]\n' +
            '                }\n' +
            '            }\n' +
            '        }, \n' +
            '        "TrumpetDynamoDBTable": {\n' +
            '            "Type": "AWS::DynamoDB::Table", \n' +
            '            "Properties": {\n' +
            '                "KeySchema": [\n' +
            '                    {\n' +
            '                        "KeyType": "HASH", \n' +
            '                        "AttributeName": "metric_dimension"\n' +
            '                    }\n' +
            '                ], \n' +
            '                "TableName": "splunk_metrics_highwater", \n' +
            '                "AttributeDefinitions": [\n' +
            '                    {\n' +
            '                        "AttributeName": "metric_dimension", \n' +
            '                        "AttributeType": "S"\n' +
            '                    }\n' +
            '                ], \n' +
            '                "ProvisionedThroughput": {\n' +
            '                    "WriteCapacityUnits": "100", \n' +
            '                    "ReadCapacityUnits": "100"\n' +
            '                }\n' +
            '            }\n' +
            '        }, \n' +
            '        "ConfigNotificationFirehoseDeliveryRole": {\n' +
            '            "Type": "AWS::IAM::Role", \n' +
            '            "Properties": {\n' +
            '                "AssumeRolePolicyDocument": {\n' +
            '                    "Version": "2012-10-17", \n' +
            '                    "Statement": [\n' +
            '                        {\n' +
            '                            "Action": "sts:AssumeRole", \n' +
            '                            "Sid": "", \n' +
            '                            "Effect": "Allow", \n' +
            '                            "Principal": {\n' +
            '                                "Service": "events.amazonaws.com"\n' +
            '                            }\n' +
            '                        }\n' +
            '                    ]\n' +
            '                }\n' +
            '            }\n' +
            '        }, \n' +
            '        "BackingLambdaExecutionConfigLogProcessorRole": {\n' +
            '            "Type": "AWS::IAM::Role", \n' +
            '            "Properties": {\n' +
            '                "Path": "/", \n' +
            '                "ManagedPolicyArns": [\n' +
            '                    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"\n' +
            '                ], \n' +
            '                "Policies": [\n' +
            '                    {\n' +
            '                        "PolicyName": "BackingLambdaExecutionConfigLogProcessorPolicy", \n' +
            '                        "PolicyDocument": {\n' +
            '                            "Version": "2012-10-17", \n' +
            '                            "Statement": [\n' +
            '                                {\n' +
            '                                    "Action": [\n' +
            '                                        "s3:getObject", \n' +
            '                                        "s3:putObject", \n' +
            '                                        "s3:ListBucket"\n' +
            '                                    ], \n' +
            '                                    "Resource": {\n' +
            '                                        "Fn::Join": [\n' +
            '                                            "", \n' +
            '                                            [\n' +
            '                                                {\n' +
            '                                                    "Fn::GetAtt": [\n' +
            '                                                        "ConfigurationRecorderSanitisationResults", \n' +
            '                                                        "FinalS3BucketConfigArn"\n' +
            '                                                    ]\n' +
            '                                                }, \n' +
            '                                                "/AWSLogs/", \n' +
            '                                                {\n' +
            '                                                    "Ref": "AWS::AccountId"\n' +
            '                                                }, \n' +
            '                                                "/*"\n' +
            '                                            ]\n' +
            '                                        ]\n' +
            '                                    }, \n' +
            '                                    "Effect": "Allow"\n' +
            '                                }\n' +
            '                            ]\n' +
            '                        }\n' +
            '                    }\n' +
            '                ], \n' +
            '                "AssumeRolePolicyDocument": {\n' +
            '                    "Version": "2012-10-17", \n' +
            '                    "Statement": [\n' +
            '                        {\n' +
            '                            "Action": [\n' +
            '                                "sts:AssumeRole"\n' +
            '                            ], \n' +
            '                            "Effect": "Allow", \n' +
            '                            "Principal": {\n' +
            '                                "Service": [\n' +
            '                                    "lambda.amazonaws.com"\n' +
            '                                ]\n' +
            '                            }\n' +
            '                        }\n' +
            '                    ]\n' +
            '                }\n' +
            '            }\n' +
            '        }, \n' +
            '        "ConfigNotificationBackupS3Role": {\n' +
            '            "Type": "AWS::IAM::Role", \n' +
            '            "Properties": {\n' +
            '                "Path": "/", \n' +
            '                "Policies": [\n' +
            '                    {\n' +
            '                        "PolicyName": "root", \n' +
            '                        "PolicyDocument": {\n' +
            '                            "Version": "2012-10-17", \n' +
            '                            "Statement": [\n' +
            '                                {\n' +
            '                                    "Action": [\n' +
            '                                        "s3:AbortMultipartUpload", \n' +
            '                                        "s3:GetBucketLocation", \n' +
            '                                        "s3:GetObject", \n' +
            '                                        "s3:ListBucket", \n' +
            '                                        "s3:ListBucketMultipartUploads", \n' +
            '                                        "s3:PutObject"\n' +
            '                                    ], \n' +
            '                                    "Resource": [\n' +
            '                                        {\n' +
            '                                            "Fn::GetAtt": [\n' +
            '                                                "ConfigNotificationBackupS3Bucket", \n' +
            '                                                "Arn"\n' +
            '                                            ]\n' +
            '                                        }\n' +
            '                                    ], \n' +
            '                                    "Effect": "Allow"\n' +
            '                                }, \n' +
            '                                {\n' +
            '                                    "Action": [\n' +
            '                                        "logs:CreateLogGroup", \n' +
            '                                        "logs:CreateLogStream", \n' +
            '                                        "logs:PutLogEvents"\n' +
            '                                    ], \n' +
            '                                    "Resource": "*", \n' +
            '                                    "Effect": "Allow"\n' +
            '                                }\n' +
            '                            ]\n' +
            '                        }\n' +
            '                    }\n' +
            '                ], \n' +
            '                "AssumeRolePolicyDocument": {\n' +
            '                    "Version": "2012-10-17", \n' +
            '                    "Statement": [\n' +
            '                        {\n' +
            '                            "Action": "sts:AssumeRole", \n' +
            '                            "Sid": "", \n' +
            '                            "Effect": "Allow", \n' +
            '                            "Principal": {\n' +
            '                                "Service": "firehose.amazonaws.com"\n' +
            '                            }\n' +
            '                        }\n' +
            '                    ]\n' +
            '                }\n' +
            '            }\n' +
            '        }\n' +
            '    }\n' +
            '}');

        var HEC_ENDPOINT = this.state.EndpointValue;
        var CFG_NOTIFICATION_HEC_TOKEN = this.state.items[0].tokenValue;
        var CFG_SNAPSHOT_HEC_TOKEN = this.state.items[1].tokenValue;
        var CT_HEC_TOKEN = this.state.items[2].tokenValue;
        var CWM_HEC_TOKEN = this.state.items[3].tokenValue;

        const namespaces = this.state.values;
        const items = this.state.items;

        // 1: AWS Config Notifications
        // 2: AWS Config Snapshots
        // 3: AWS CloudTrail
        // 4: AWS CloudWatch Metrics

        // TODO Pull from a static list to make maintainability easier as the CFN template changes

        // Parameters will be automatically set if needed
        delete template["Parameters"];

        // Config Notification
        if (!items[0].done) {
            // Delete all resources related to config notification logging from template
            delete template["Resources"]["ConfigNotificationBackupS3Bucket"];
            delete template["Resources"]["ConfigNotificationBackupS3Role"];
            delete template["Resources"]["ConfigNotificationFirehoseDeliveryRole"];
            delete template["Resources"]["ConfigNotificationFirehoseDeliveryPolicy"];
            delete template["Resources"]["ConfigNotificationEventRule"];
            delete template["Resources"]["ConfigNotificationFirehoseDeliveryStream"];
        } else {
            // Set tokens
            template["Resources"]["ConfigNotificationFirehoseDeliveryStream"]["Properties"]["SplunkDestinationConfiguration"]["HECEndpoint"] = HEC_ENDPOINT;
            template["Resources"]["ConfigNotificationFirehoseDeliveryStream"]["Properties"]["SplunkDestinationConfiguration"]["HECToken"] = CFG_NOTIFICATION_HEC_TOKEN;

        }

        // Config Snapshot
        if (!items[1].done) {
            // Delete all resources related to config snapshot logging from template
            delete template["Resources"]["S3BucketConfig"];
            delete template["Resources"]["ConfigRole"];
            delete template["Resources"]["BackingLambdaExecutionConfigLogProcessorRole"];
            delete template["Resources"]["BackingLambdaConfigLogProcessor"];
            delete template["Resources"]["ConfigBucketConfiguration"];
            delete template["Resources"]["ConfigUpdateBucketConfiguration"];
            delete template["Resources"]["ConfigBucketPermission"];
            delete template["Resources"]["ConfigurationRecorderLambdaExecutionRole"];
            delete template["Resources"]["ConfigurationRecorderSanitiser"];
            delete template["Resources"]["BackingLambdaExecutionConfigLogProcessor"];
            delete template["Resources"]["ConfigurationRecorderSanitizationLambdaExecutionRole"];
            delete template["Resources"]["ConfigurationRecorderSanitisationResults"];
        } else {
            // Set tokens
            template["Resources"]["BackingLambdaConfigLogProcessor"]["Properties"]["Environment"]["Variables"]["SPLUNK_HEC_URL"] = HEC_ENDPOINT;
            template["Resources"]["BackingLambdaConfigLogProcessor"]["Properties"]["Environment"]["Variables"]["SPLUNK_HEC_TOKEN"] = CFG_SNAPSHOT_HEC_TOKEN;

        }

        // CloudTrail
        if (!items[2].done) {
            // Delete all resources related to cloudtrail logging from template
            delete template["Resources"]["CloudTrailBackupS3Bucket"];
            delete template["Resources"]["CloudTrailBackupS3Role"];
            delete template["Resources"]["CloudTrailFirehoseDeliveryRole"];
            delete template["Resources"]["CloudTrailFirehoseDeliveryPolicy"];
            delete template["Resources"]["CloudTrailEventRule"];
            delete template["Resources"]["CloudTrailFirehoseDeliveryStream"];
        } else {
            // We are logging CloudTrail. Set tokens accordingly
            template["Resources"]["CloudTrailFirehoseDeliveryStream"]["Properties"]["SplunkDestinationConfiguration"]["HECEndpoint"] = HEC_ENDPOINT;
            template["Resources"]["CloudTrailFirehoseDeliveryStream"]["Properties"]["SplunkDestinationConfiguration"]["HECToken"] = CT_HEC_TOKEN;

        }

        var mapping_dict = {'54': 'WorkSpaces', '42': 'SageMaker', '48': 'SWF', '43': 'DDoSProtection', '49': 'States', '52': 'NATGateway', '53': 'VPN', '24': 'ES', '25': 'ElasticMapReduce', '26': 'GameLift', '27': 'Inspector', '20': 'ApplicationELB', '21': 'NetworkELB', '22': 'ElasticTranscoder', '23': 'ElastiCache', '46': 'SQS', '47': 'S3', '44': 'SES', '45': 'SNS', '28': 'IoT', '29': 'KMS', '40': 'RDS', '41': 'Route53', '1': 'ApiGateway', '3': 'AutoScaling', '2': 'AppStream', '5': 'CloudFront', '4': 'Billing', '7': 'Events', '6': 'CloudSearch', '9': 'Connect', '8': 'Logs', '51': 'Translate', '39': 'Redshift', '38': 'Polly', '11': 'DX', '10': 'DMS', '13': 'EC2', '12': 'DynamoDB', '15': 'ECS', '14': 'EC2Spot', '17': 'EBS', '16': 'ElasticBeanstalk', '19': 'ELB', '18': 'EFS', '31': 'Firehose', '30': 'KinesisAnalytics', '37': 'OpsWorks', '36': 'ML', '35': 'Lex', '34': 'Lambda', '33': 'KinesisVideo', '32': 'Kinesis', '50': 'StorageGateway'};

        // CloudWatch Metrics
        if (!items[3].done) {
            delete template["Resources"]["TrumpetDynamoDBTable"];
            delete template["Resources"]["BackingLambdaCloudWatchMetricsProcessor"];
            delete template["Resources"]["BackingLambdaExecutionRoleCloudWatchMetricsProcessor"];
            delete template["Resources"]["EventRule"];
            delete template["Resources"]["PermissionForEventsToInvokeLambda"];
        } else {
            // Loop through all selected AWS namespaces
            var lambda_template = template["Resources"]["BackingLambdaCloudWatchMetricsProcessor"];
            var lambda_role_template = template["Resources"]["BackingLambdaExecutionRoleCloudWatchMetricsProcessor"];
            var cwe_template = template["Resources"]["EventRule"];
            var cwe_permission_template = template["Resources"]["PermissionForEventsToInvokeLambda"];

            for (var i = 0; i < namespaces.length; i++) {
                // Lambda set up

                var new_lambda = {};
                for(var key in lambda_template) {
                    new_lambda[key] = lambda_template[key];
                }

                template["Resources"]["BackingLambdaCloudWatchMetricsProcessor" + mapping_dict[namespaces[i]]] = JSON.parse(JSON.stringify(lambda_template));
                // Set role
                template["Resources"]["BackingLambdaCloudWatchMetricsProcessor" + mapping_dict[namespaces[i]]]["Properties"]["Role"]["Fn::GetAtt"][0] = "BackingLambdaExecutionRoleCloudWatchMetricsProcessor" + mapping_dict[namespaces[i]];
                // Set tokens
                template["Resources"]["BackingLambdaCloudWatchMetricsProcessor" + mapping_dict[namespaces[i]]]["Properties"]["Environment"]["Variables"]["SPLUNK_HEC_URL"] = HEC_ENDPOINT;
                template["Resources"]["BackingLambdaCloudWatchMetricsProcessor" + mapping_dict[namespaces[i]]]["Properties"]["Environment"]["Variables"]["SPLUNK_HEC_TOKEN"] = CWM_HEC_TOKEN;
                template["Resources"]["BackingLambdaCloudWatchMetricsProcessor" + mapping_dict[namespaces[i]]]["Properties"]["Environment"]["Variables"]["NAMESPACE"] = "AWS/" + mapping_dict[namespaces[i]];

                // Lambda role set up
                template["Resources"]["BackingLambdaExecutionRoleCloudWatchMetricsProcessor" + mapping_dict[namespaces[i]]] = JSON.parse(JSON.stringify(lambda_role_template));
                // Set policy name
                template["Resources"]["BackingLambdaExecutionRoleCloudWatchMetricsProcessor" + mapping_dict[namespaces[i]]]["Properties"]["Policies"]["PolicyName"] = "BackingLambdaExecutionRoleCloudWatchMetricsProcessor" + mapping_dict[namespaces[i]];

                // CWE set up
                template["Resources"]["EventRule" + mapping_dict[namespaces[i]]] = JSON.parse(JSON.stringify(cwe_template));
                // Set lambda function name
                template["Resources"]["EventRule" + mapping_dict[namespaces[i]]]["Properties"]["Targets"][0]["Arn"]["Fn::GetAtt"][0] = "BackingLambdaCloudWatchMetricsProcessor" + mapping_dict[namespaces[i]];
                // Set lambda policy name
                template["Resources"]["EventRule" + mapping_dict[namespaces[i]]]["Properties"]["Targets"][0]["Id"] = "TargetFunctionMetricsPoller" + mapping_dict[namespaces[i]];

                // CWE Permission set up
                template["Resources"]["PermissionForEventsToInvokeLambda" + mapping_dict[namespaces[i]]] = JSON.parse(JSON.stringify(cwe_permission_template));
                // Set lambda function name
                template["Resources"]["PermissionForEventsToInvokeLambda" + mapping_dict[namespaces[i]]]["Properties"]["FunctionName"]["Ref"] = "BackingLambdaCloudWatchMetricsProcessor" + mapping_dict[namespaces[i]];
                // Set CWE source
                template["Resources"]["PermissionForEventsToInvokeLambda" + mapping_dict[namespaces[i]]]["Properties"]["SourceArn"]["Fn::GetAtt"][0] = "EventRule" + mapping_dict[namespaces[i]]
            }

            console.log(template);

            // Delete metric logging arch templates
            delete template["Resources"]["BackingLambdaCloudWatchMetricsProcessor"];
            delete template["Resources"]["BackingLambdaExecutionRoleCloudWatchMetricsProcessor"];
            delete template["Resources"]["EventRule"];
            delete template["Resources"]["PermissionForEventsToInvokeLambda"];
        }

        var textFile = null, makeTextFile = function (text) {
            var data = new Blob([text], {type: 'text/plain'});

            // If we are replacing a previously generated file we need to
            // manually revoke the object URL to avoid memory leaks.
            if (textFile !== null) {
              window.URL.revokeObjectURL(textFile);
            }

            textFile = window.URL.createObjectURL(data);

            return textFile;
        };

        var anchor = document.createElement('a');
        anchor.href = makeTextFile(JSON.stringify(template));
        anchor.target = '_blank';
        anchor.download = "customized_splunk_aws_template.json";
        anchor.click();
    }
}

export default SplunkAwsConfigurationWebsite;
