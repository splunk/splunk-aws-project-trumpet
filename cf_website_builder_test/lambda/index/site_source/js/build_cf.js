$(document).ready(function () {
  var template;
  var items;

	function save_to_local_json() {
	    var items_json = JSON.stringify(items);
	    localStorage.setItem('items', items_json);
	};

	function save_to_local_template() {
		//console.log(template);
	    var template_json = JSON.stringify(template);
	    localStorage.setItem('template', template_json);
	};


	function read_from_local_json() {
	    var items_json = localStorage.getItem('items');
	    items = JSON.parse(items_json);

	    // If the file is empty
	    if (!items) {
	        items = {};
	    }
	};

	function read_from_local_template() {
	    var template_json = localStorage.getItem('template');
	    template = JSON.parse(template_json);

	    // If the file is empty
	    if (!template || Object.keys(template).length === 0) {
	    	//console.log("what");
	        template = JSON.parse(
		  	'{ \
			  "AWSTemplateFormatVersion": "2010-09-09" \
			}');
			//console.log(template);
			save_to_local_template();
	    }
	};


	read_from_local_template();
	read_from_local_json();
	//make_list();
	//console.log("ready was called")

	$('#createCF').click(function () {
	    var text = $('#HEC_endpoint').val();
	    alert(text);
	    items["HEC_endpoint"] = text;
	    save_to_local_json();
	});

	$("#doesEverything").click(function () {
		template = JSON.parse(
		  	'{ \
			    "AWSTemplateFormatVersion": "2010-09-09",  \
			    "Resources": { \
			        "S3BucketConfig": { \
			            "Type": "AWS::S3::Bucket",  \
			            "Properties": { \
			                "VersioningConfiguration": { \
			                    "Status": "Enabled" \
			                } \
			            } \
			        },  \
			        "CloudTrailLambdaExecutionRole": { \
			            "Type": "AWS::IAM::Role",  \
			            "Properties": { \
			                "Path": "/",  \
			                "ManagedPolicyArns": [ \
			                    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole" \
			                ],  \
			                "Policies": [ \
			                    { \
			                        "PolicyName": "CloudTrailLambdaExecutionRolePolicy",  \
			                        "PolicyDocument": { \
			                            "Version": "2012-10-17",  \
			                            "Statement": [ \
			                                { \
			                                    "Action": [ \
			                                        "s3:PutObject",  \
			                                        "s3:DeleteObject",  \
			                                        "s3:PutBucketNotification",  \
			                                        "s3:GetBucketPolicy" \
			                                    ],  \
			                                    "Resource": { \
			                                        "Fn::GetAtt": [ \
			                                            "CloudTrailSanitisationResults",  \
			                                            "FinalS3BucketCloudTrailArn" \
			                                        ] \
			                                    },  \
			                                    "Effect": "Allow" \
			                                } \
			                            ] \
			                        } \
			                    } \
			                ],  \
			                "AssumeRolePolicyDocument": { \
			                    "Version": "2012-10-17",  \
			                    "Statement": [ \
			                        { \
			                            "Action": [ \
			                                "sts:AssumeRole" \
			                            ],  \
			                            "Effect": "Allow",  \
			                            "Principal": { \
			                                "Service": [ \
			                                    "lambda.amazonaws.com" \
			                                ] \
			                            } \
			                        } \
			                    ] \
			                } \
			            } \
			        },  \
			        "CloudTrailBucketPolicy": { \
			            "Type": "AWS::S3::BucketPolicy",  \
			            "Properties": { \
			                "PolicyDocument": { \
			                    "Version": "2012-10-17",  \
			                    "Statement": [ \
			                        { \
			                            "Action": "s3:GetBucketAcl",  \
			                            "Principal": { \
			                                "Service": "cloudtrail.amazonaws.com" \
			                            },  \
			                            "Resource": { \
			                                "Fn::GetAtt": [ \
			                                    "S3BucketCloudTrail",  \
			                                    "Arn" \
			                                ] \
			                            },  \
			                            "Effect": "Allow",  \
			                            "Sid": "AWSCloudTrailAclCheck" \
			                        },  \
			                        { \
			                            "Resource": { \
			                                "Fn::Join": [ \
			                                    "",  \
			                                    [ \
			                                        "arn:aws:s3:::",  \
			                                        { \
			                                            "Ref": "S3BucketCloudTrail" \
			                                        },  \
			                                        "/AWSLogs/",  \
			                                        { \
			                                            "Ref": "AWS::AccountId" \
			                                        },  \
			                                        "/*" \
			                                    ] \
			                                ] \
			                            },  \
			                            "Effect": "Allow",  \
			                            "Sid": "AWSCloudTrailWrite",  \
			                            "Action": "s3:PutObject",  \
			                            "Condition": { \
			                                "StringEquals": { \
			                                    "s3:x-amz-acl": "bucket-owner-full-control" \
			                                } \
			                            },  \
			                            "Principal": { \
			                                "Service": "cloudtrail.amazonaws.com" \
			                            } \
			                        } \
			                    ] \
			                },  \
			                "Bucket": { \
			                    "Ref": "S3BucketCloudTrail" \
			                } \
			            } \
			        },  \
			        "ConfigBucketConfiguration": { \
			            "Type": "Custom::S3ConfigBucketConfiguration",  \
			            "Properties": { \
			                "Bucket": { \
			                    "Fn::GetAtt": [ \
			                        "ConfigurationRecorderSanitisationResults",  \
			                        "FinalS3BucketConfig" \
			                    ] \
			                },  \
			                "ServiceToken": { \
			                    "Fn::GetAtt": [ \
			                        "ConfigUpdateBucketConfiguration",  \
			                        "Arn" \
			                    ] \
			                },  \
			                "NotificationConfiguration": { \
			                    "LambdaFunctionConfigurations": [ \
			                        { \
			                            "LambdaFunctionArn": { \
			                                "Fn::GetAtt": [ \
			                                    "BackingLambdaConfigLogProcessor",  \
			                                    "Arn" \
			                                ] \
			                            },  \
			                            "Events": [ \
			                                "s3:ObjectCreated:*" \
			                            ] \
			                        } \
			                    ] \
			                } \
			            },  \
			            "DependsOn": [ \
			                "ConfigBucketPermission" \
			            ] \
			        },  \
			        "ConfigurationRecorderSanitiser": { \
			            "Type": "AWS::Lambda::Function",  \
			            "Properties": { \
			                "Handler": "index.handler",  \
			                "Code": { \
			                    "S3Bucket": "nstone-website-test",  \
			                    "S3Key": "3f262f31b0cfb22d3389967305c8b01e" \
			                },  \
			                "Role": { \
			                    "Fn::GetAtt": [ \
			                        "ConfigurationRecorderSanitizationLambdaExecutionRole",  \
			                        "Arn" \
			                    ] \
			                },  \
			                "Timeout": 300,  \
			                "Runtime": "nodejs6.10" \
			            } \
			        },  \
			        "EventRule": { \
			            "Type": "AWS::Events::Rule",  \
			            "Properties": { \
			                "State": "ENABLED",  \
			                "ScheduleExpression": "rate(5 minutes)",  \
			                "Description": "EventRule",  \
			                "Targets": [ \
			                    { \
			                        "Id": "TargetFunctionMetricsPoller",  \
			                        "Arn": { \
			                            "Fn::GetAtt": [ \
			                                "BackingLambdaCloudWatchMetricsProcessor",  \
			                                "Arn" \
			                            ] \
			                        } \
			                    } \
			                ] \
			            } \
			        },  \
			        "BackingLambdaCloudTrailLogProcessor": { \
			            "Type": "AWS::Lambda::Function",  \
			            "Properties": { \
			                "Code": { \
			                    "S3Bucket": "nstone-website-test",  \
			                    "S3Key": "151348a756a7bfffd0aa7c7c81bb0506" \
			                },  \
			                "Description": "Stream events from an AWS S3 bucket being updated by AWS CloudTrail to Splunk using HTTP event collector",  \
			                "MemorySize": 512,  \
			                "Environment": { \
			                    "Variables": { \
			                        "SPLUNK_HEC_URL": { \
			                            "Ref": "SplunkHttpEventCollectorURL" \
			                        },  \
			                        "SPLUNK_HEC_TOKEN": { \
			                            "Ref": "CloudTrailSplunkHttpEventCollectorToken" \
			                        } \
			                    } \
			                },  \
			                "Handler": "index.handler",  \
			                "Role": { \
			                    "Fn::GetAtt": [ \
			                        "BackingLambdaExecutionCloudTrailLogProcessor",  \
			                        "Arn" \
			                    ] \
			                },  \
			                "Timeout": 300,  \
			                "Runtime": "nodejs6.10" \
			            } \
			        },  \
			        "CloudTrailBucketPermission": { \
			            "Type": "AWS::Lambda::Permission",  \
			            "Properties": { \
			                "Action": "lambda:InvokeFunction",  \
			                "SourceAccount": { \
			                    "Ref": "AWS::AccountId" \
			                },  \
			                "FunctionName": { \
			                    "Ref": "BackingLambdaCloudTrailLogProcessor" \
			                },  \
			                "SourceArn": { \
			                    "Fn::GetAtt": [ \
			                        "CloudTrailSanitisationResults",  \
			                        "FinalS3BucketCloudTrailArn" \
			                    ] \
			                },  \
			                "Principal": "s3.amazonaws.com" \
			            } \
			        },  \
			        "CloudTrailBucketConfiguration": { \
			            "Type": "Custom::S3CloudTrailBucketConfiguration",  \
			            "Properties": { \
			                "Bucket": { \
			                    "Fn::GetAtt": [ \
			                        "CloudTrailSanitisationResults",  \
			                        "FinalS3BucketCloudTrail" \
			                    ] \
			                },  \
			                "ServiceToken": { \
			                    "Fn::GetAtt": [ \
			                        "CloudTrailUpdateBucketConfiguration",  \
			                        "Arn" \
			                    ] \
			                },  \
			                "NotificationConfiguration": { \
			                    "LambdaFunctionConfigurations": [ \
			                        { \
			                            "LambdaFunctionArn": { \
			                                "Fn::GetAtt": [ \
			                                    "BackingLambdaCloudTrailLogProcessor",  \
			                                    "Arn" \
			                                ] \
			                            },  \
			                            "Events": [ \
			                                "s3:ObjectCreated:*" \
			                            ] \
			                        } \
			                    ] \
			                } \
			            },  \
			            "DependsOn": [ \
			                "CloudTrailBucketPermission",  \
			                "CloudTrailBucketPolicy" \
			            ] \
			        },  \
			        "TrumpetDynamoDBTable": { \
			            "Type": "AWS::DynamoDB::Table",  \
			            "Properties": { \
			                "KeySchema": [ \
			                    { \
			                        "KeyType": "HASH",  \
			                        "AttributeName": "metric_dimension" \
			                    } \
			                ],  \
			                "TableName": "splunk_metrics_highwater",  \
			                "AttributeDefinitions": [ \
			                    { \
			                        "AttributeName": "metric_dimension",  \
			                        "AttributeType": "S" \
			                    } \
			                ],  \
			                "ProvisionedThroughput": { \
			                    "WriteCapacityUnits": "100",  \
			                    "ReadCapacityUnits": "100" \
			                } \
			            } \
			        },  \
			        "BackingLambdaExecutionConfigLogProcessorRole": { \
			            "Type": "AWS::IAM::Role",  \
			            "Properties": { \
			                "Path": "/",  \
			                "ManagedPolicyArns": [ \
			                    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole" \
			                ],  \
			                "Policies": [ \
			                    { \
			                        "PolicyName": "BackingLambdaExecutionConfigLogProcessorPolicy",  \
			                        "PolicyDocument": { \
			                            "Version": "2012-10-17",  \
			                            "Statement": [ \
			                                { \
			                                    "Action": [ \
			                                        "s3:getObject",  \
			                                        "s3:putObject",  \
			                                        "s3:ListBucket" \
			                                    ],  \
			                                    "Resource": { \
			                                        "Fn::Join": [ \
			                                            "",  \
			                                            [ \
			                                                { \
			                                                    "Fn::GetAtt": [ \
			                                                        "ConfigurationRecorderSanitisationResults",  \
			                                                        "FinalS3BucketConfigArn" \
			                                                    ] \
			                                                },  \
			                                                "/AWSLogs/",  \
			                                                { \
			                                                    "Ref": "AWS::AccountId" \
			                                                },  \
			                                                "/*" \
			                                            ] \
			                                        ] \
			                                    },  \
			                                    "Effect": "Allow" \
			                                } \
			                            ] \
			                        } \
			                    } \
			                ],  \
			                "AssumeRolePolicyDocument": { \
			                    "Version": "2012-10-17",  \
			                    "Statement": [ \
			                        { \
			                            "Action": [ \
			                                "sts:AssumeRole" \
			                            ],  \
			                            "Effect": "Allow",  \
			                            "Principal": { \
			                                "Service": [ \
			                                    "lambda.amazonaws.com" \
			                                ] \
			                            } \
			                        } \
			                    ] \
			                } \
			            } \
			        },  \
			        "BackingLambdaExecutionCloudTrailLogProcessor": { \
			            "Type": "AWS::IAM::Role",  \
			            "Properties": { \
			                "Path": "/",  \
			                "ManagedPolicyArns": [ \
			                    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole" \
			                ],  \
			                "Policies": [ \
			                    { \
			                        "PolicyName": "BackingLambdaExecutionCloudTrailLogProcessorPolicy",  \
			                        "PolicyDocument": { \
			                            "Version": "2012-10-17",  \
			                            "Statement": [ \
			                                { \
			                                    "Action": [ \
			                                        "s3:getObject",  \
			                                        "s3:putObject",  \
			                                        "s3:ListBucket" \
			                                    ],  \
			                                    "Resource": { \
			                                        "Fn::Join": [ \
			                                            "",  \
			                                            [ \
			                                                "arn:aws:s3:::",  \
			                                                { \
			                                                    "Ref": "S3BucketCloudTrail" \
			                                                },  \
			                                                "/*" \
			                                            ] \
			                                        ] \
			                                    },  \
			                                    "Effect": "Allow" \
			                                } \
			                            ] \
			                        } \
			                    } \
			                ],  \
			                "AssumeRolePolicyDocument": { \
			                    "Version": "2012-10-17",  \
			                    "Statement": [ \
			                        { \
			                            "Action": [ \
			                                "sts:AssumeRole" \
			                            ],  \
			                            "Effect": "Allow",  \
			                            "Principal": { \
			                                "Service": [ \
			                                    "lambda.amazonaws.com" \
			                                ] \
			                            } \
			                        } \
			                    ] \
			                } \
			            } \
			        },  \
			        "CloudTrailUpdateBucketConfiguration": { \
			            "Type": "AWS::Lambda::Function",  \
			            "Properties": { \
			                "Code": { \
			                    "ZipFile": { \
			                        "Fn::Sub": "var response = require(\'cfn-response\');\\nvar AWS = require(\'aws-sdk\');\\nvar s3 = new AWS.S3();\\nexports.handler = function(event, context) {\\n  var respond = (e) => response.send(event, context, e ? response.FAILED : response.SUCCESS, e ? e : {});\\n  var params = event.ResourceProperties;\\n  delete params.ServiceToken;\\n  if (event.RequestType === \'Delete\') {\\n    params.NotificationConfiguration = {};\\n    s3.putBucketNotificationConfiguration(params).promise()\\n      .then((data)=>respond())\\n      .catch((e)=>respond());\\n  } else {\\n    s3.putBucketNotificationConfiguration(params).promise()\\n      .then((data)=>respond())\\n      .catch((e)=>respond(e));\\n  }\\n};\\n" \
			                    } \
			                },  \
			                "Description": "S3 Object Custom Resource",  \
			                "Handler": "index.handler",  \
			                "Role": { \
			                    "Fn::GetAtt": [ \
			                        "CloudTrailLambdaExecutionRole",  \
			                        "Arn" \
			                    ] \
			                },  \
			                "Timeout": 300,  \
			                "Runtime": "nodejs4.3" \
			            } \
			        },  \
			        "BackingLambdaCloudWatchMetricsProcessor": { \
			            "Type": "AWS::Lambda::Function",  \
			            "Properties": { \
			                "Code": { \
			                    "S3Bucket": "nstone-website-test",  \
			                    "S3Key": "d5f6e5bfc67e34ad3fdc05ee6f63881c" \
			                },  \
			                "Description": "Send CloudWatch Metrics to Splunk using HTTP event collector",  \
			                "MemorySize": 512,  \
			                "Environment": { \
			                    "Variables": { \
			                        "SPLUNK_HEC_URL": { \
			                            "Ref": "SplunkHttpEventCollectorURL" \
			                        },  \
			                        "SPLUNK_HEC_TOKEN": { \
			                            "Ref": "CloudWatchSplunkHttpEventCollectorToken" \
			                        } \
			                    } \
			                },  \
			                "Handler": "index.handler",  \
			                "Role": { \
			                    "Fn::GetAtt": [ \
			                        "BackingLambdaExecutionRoleCloudWatchMetricsProcessor",  \
			                        "Arn" \
			                    ] \
			                },  \
			                "Timeout": 300,  \
			                "Runtime": "nodejs6.10" \
			            } \
			        },  \
			        "ConfigurationRecorderLambdaExecutionRole": { \
			            "Type": "AWS::IAM::Role",  \
			            "Properties": { \
			                "Path": "/",  \
			                "ManagedPolicyArns": [ \
			                    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole" \
			                ],  \
			                "Policies": [ \
			                    { \
			                        "PolicyName": "ConfigLambdaExecutionRolePolicy",  \
			                        "PolicyDocument": { \
			                            "Version": "2012-10-17",  \
			                            "Statement": [ \
			                                { \
			                                    "Action": [ \
			                                        "s3:PutObject",  \
			                                        "s3:DeleteObject",  \
			                                        "s3:GetBucketPolicy",  \
			                                        "s3:PutBucketNotification" \
			                                    ],  \
			                                    "Resource": { \
			                                        "Fn::GetAtt": [ \
			                                            "ConfigurationRecorderSanitisationResults",  \
			                                            "FinalS3BucketConfigArn" \
			                                        ] \
			                                    },  \
			                                    "Effect": "Allow" \
			                                } \
			                            ] \
			                        } \
			                    } \
			                ],  \
			                "AssumeRolePolicyDocument": { \
			                    "Version": "2012-10-17",  \
			                    "Statement": [ \
			                        { \
			                            "Action": [ \
			                                "sts:AssumeRole" \
			                            ],  \
			                            "Effect": "Allow",  \
			                            "Principal": { \
			                                "Service": [ \
			                                    "lambda.amazonaws.com" \
			                                ] \
			                            } \
			                        } \
			                    ] \
			                } \
			            } \
			        },  \
			        "ConfigBucketPermission": { \
			            "Type": "AWS::Lambda::Permission",  \
			            "Properties": { \
			                "Action": "lambda:InvokeFunction",  \
			                "SourceAccount": { \
			                    "Ref": "AWS::AccountId" \
			                },  \
			                "FunctionName": { \
			                    "Ref": "BackingLambdaConfigLogProcessor" \
			                },  \
			                "SourceArn": { \
			                    "Fn::GetAtt": [ \
			                        "ConfigurationRecorderSanitisationResults",  \
			                        "FinalS3BucketConfigArn" \
			                    ] \
			                },  \
			                "Principal": "s3.amazonaws.com" \
			            } \
			        },  \
			        "BackingLambdaExecutionRoleCloudWatchMetricsProcessor": { \
			            "Type": "AWS::IAM::Role",  \
			            "Properties": { \
			                "Path": "/",  \
			                "ManagedPolicyArns": [ \
			                    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole" \
			                ],  \
			                "Policies": [ \
			                    { \
			                        "PolicyName": "BackingLambdaExecutionCloudWatchMetricsPolicy",  \
			                        "PolicyDocument": { \
			                            "Version": "2012-10-17",  \
			                            "Statement": [ \
			                                { \
			                                    "Action": [ \
			                                        "logs:CreateLogGroup",  \
			                                        "logs:CreateLogStream",  \
			                                        "logs:PutLogEvents" \
			                                    ],  \
			                                    "Resource": [ \
			                                        "arn:aws:logs:*:*:*" \
			                                    ],  \
			                                    "Effect": "Allow" \
			                                },  \
			                                { \
			                                    "Action": [ \
			                                        "lambda:UpdateFunctionConfiguration" \
			                                    ],  \
			                                    "Resource": [ \
			                                        "*" \
			                                    ],  \
			                                    "Effect": "Allow" \
			                                },  \
			                                { \
			                                    "Action": [ \
			                                        "cloudwatch:GetMetricStatistics",  \
			                                        "cloudwatch:ListMetrics" \
			                                    ],  \
			                                    "Resource": [ \
			                                        "*" \
			                                    ],  \
			                                    "Effect": "Allow" \
			                                },  \
			                                { \
			                                    "Action": [ \
			                                        "dynamodb:GetItem",  \
			                                        "dynamodb:UpdateItem" \
			                                    ],  \
			                                    "Resource": [ \
			                                        "*" \
			                                    ],  \
			                                    "Effect": "Allow" \
			                                } \
			                            ] \
			                        } \
			                    } \
			                ],  \
			                "AssumeRolePolicyDocument": { \
			                    "Version": "2012-10-17",  \
			                    "Statement": [ \
			                        { \
			                            "Action": [ \
			                                "sts:AssumeRole" \
			                            ],  \
			                            "Effect": "Allow",  \
			                            "Principal": { \
			                                "Service": [ \
			                                    "lambda.amazonaws.com" \
			                                ] \
			                            } \
			                        } \
			                    ] \
			                } \
			            } \
			        },  \
			        "S3BucketCloudTrail": { \
			            "Type": "AWS::S3::Bucket",  \
			            "Properties": { \
			                "VersioningConfiguration": { \
			                    "Status": "Enabled" \
			                } \
			            } \
			        },  \
			        "ConfigUpdateBucketConfiguration": { \
			            "Type": "AWS::Lambda::Function",  \
			            "Properties": { \
			                "Code": { \
			                    "ZipFile": { \
			                        "Fn::Sub": "var response = require(\'cfn-response\');\\nvar AWS = require(\'aws-sdk\');\\nvar s3 = new AWS.S3();\\nexports.handler = function(event, context) {\\n  var respond = (e) => response.send(event, context, e ? response.FAILED : response.SUCCESS, e ? e : {});\\n  var params = event.ResourceProperties;\\n  delete params.ServiceToken;\\n  if (event.RequestType === \'Delete\') {\\n    params.NotificationConfiguration = {};\\n    s3.putBucketNotificationConfiguration(params).promise()\\n      .then((data)=>respond())\\n      .catch((e)=>respond());\\n  } else {\\n    s3.putBucketNotificationConfiguration(params).promise()\\n      .then((data)=>respond())\\n      .catch((e)=>respond(e));\\n  }\\n};\\n" \
			                    } \
			                },  \
			                "Description": "S3 Object Custom Resource",  \
			                "Handler": "index.handler",  \
			                "Role": { \
			                    "Fn::GetAtt": [ \
			                        "ConfigurationRecorderLambdaExecutionRole",  \
			                        "Arn" \
			                    ] \
			                },  \
			                "Timeout": 300,  \
			                "Runtime": "nodejs6.10" \
			            } \
			        },  \
			        "PermissionForEventsToInvokeLambda": { \
			            "Type": "AWS::Lambda::Permission",  \
			            "Properties": { \
			                "Action": "lambda:InvokeFunction",  \
			                "FunctionName": { \
			                    "Ref": "BackingLambdaCloudWatchMetricsProcessor" \
			                },  \
			                "SourceArn": { \
			                    "Fn::GetAtt": [ \
			                        "EventRule",  \
			                        "Arn" \
			                    ] \
			                },  \
			                "Principal": "events.amazonaws.com" \
			            } \
			        },  \
			        "ConfigurationRecorderSanitizationLambdaExecutionRole": { \
			            "Type": "AWS::IAM::Role",  \
			            "Properties": { \
			                "Path": "/",  \
			                "Policies": [ \
			                    { \
			                        "PolicyName": "root",  \
			                        "PolicyDocument": { \
			                            "Version": "2012-10-17",  \
			                            "Statement": [ \
			                                { \
			                                    "Action": [ \
			                                        "iam:PassRole" \
			                                    ],  \
			                                    "Resource": [ \
			                                        { \
			                                            "Fn::GetAtt": [ \
			                                                "BackingLambdaExecutionCloudTrailLogProcessor",  \
			                                                "Arn" \
			                                            ] \
			                                        } \
			                                    ],  \
			                                    "Effect": "Allow" \
			                                },  \
			                                { \
			                                    "Action": [ \
			                                        "logs:CreateLogGroup",  \
			                                        "logs:CreateLogStream",  \
			                                        "logs:PutLogEvents" \
			                                    ],  \
			                                    "Resource": "arn:aws:logs:*:*:*",  \
			                                    "Effect": "Allow" \
			                                },  \
			                                { \
			                                    "Action": [ \
			                                        "config:DescribeConfigurationRecorders",  \
			                                        "config:DescribeDeliveryChannels",  \
			                                        "config:PutConfigurationRecorder",  \
			                                        "config:StartConfigurationRecorder",  \
			                                        "config:PutDeliveryChannel",  \
			                                        "config:DescribeConfigurationRecorderStatus",  \
			                                        "config:DeleteConfigurationRecorder",  \
			                                        "config:DeleteDeliveryChannel" \
			                                    ],  \
			                                    "Resource": [ \
			                                        "*" \
			                                    ],  \
			                                    "Effect": "Allow" \
			                                },  \
			                                { \
			                                    "Action": [ \
			                                        "iam:PassRole" \
			                                    ],  \
			                                    "Resource": [ \
			                                        { \
			                                            "Fn::GetAtt": [ \
			                                                "ConfigRole",  \
			                                                "Arn" \
			                                            ] \
			                                        } \
			                                    ],  \
			                                    "Effect": "Allow" \
			                                } \
			                            ] \
			                        } \
			                    } \
			                ],  \
			                "AssumeRolePolicyDocument": { \
			                    "Version": "2012-10-17",  \
			                    "Statement": [ \
			                        { \
			                            "Action": [ \
			                                "sts:AssumeRole" \
			                            ],  \
			                            "Effect": "Allow",  \
			                            "Principal": { \
			                                "Service": [ \
			                                    "lambda.amazonaws.com" \
			                                ] \
			                            } \
			                        } \
			                    ] \
			                } \
			            } \
			        },  \
			        "CloudTrailSanitiser": { \
			            "Type": "AWS::Lambda::Function",  \
			            "Properties": { \
			                "Handler": "index.handler",  \
			                "Code": { \
			                    "S3Bucket": "nstone-website-test",  \
			                    "S3Key": "78b2e1cf2a47c72068a10b61a954a756" \
			                },  \
			                "Role": { \
			                    "Fn::GetAtt": [ \
			                        "CloudTrailSanitizationLambdaExecutionRole",  \
			                        "Arn" \
			                    ] \
			                },  \
			                "Timeout": 300,  \
			                "Runtime": "nodejs6.10" \
			            } \
			        },  \
			        "ConfigurationRecorderSanitisationResults": { \
			            "Type": "Custom::ConfigurationRecorderSanitisationResults",  \
			            "Properties": { \
			                "ServiceToken": { \
			                    "Fn::GetAtt": [ \
			                        "ConfigurationRecorderSanitiser",  \
			                        "Arn" \
			                    ] \
			                },  \
			                "RoleARN": { \
			                    "Fn::GetAtt": [ \
			                        "BackingLambdaExecutionCloudTrailLogProcessor",  \
			                        "Arn" \
			                    ] \
			                },  \
			                "S3BucketConfig": { \
			                    "Ref": "S3BucketConfig" \
			                },  \
			                "ConfigRecorderName": "ConfigRecorder",  \
			                "S3BucketConfigArn": { \
			                    "Fn::GetAtt": [ \
			                        "S3BucketConfig",  \
			                        "Arn" \
			                    ] \
			                },  \
			                "RecorderRoleArn": { \
			                    "Fn::GetAtt": [ \
			                        "ConfigRole",  \
			                        "Arn" \
			                    ] \
			                } \
			            } \
			        },  \
			        "CloudTrailSanitizationLambdaExecutionRole": { \
			            "Type": "AWS::IAM::Role",  \
			            "Properties": { \
			                "Path": "/",  \
			                "Policies": [ \
			                    { \
			                        "PolicyName": "root",  \
			                        "PolicyDocument": { \
			                            "Version": "2012-10-17",  \
			                            "Statement": [ \
			                                { \
			                                    "Action": [ \
			                                        "iam:PassRole" \
			                                    ],  \
			                                    "Resource": [ \
			                                        { \
			                                            "Fn::GetAtt": [ \
			                                                "BackingLambdaExecutionCloudTrailLogProcessor",  \
			                                                "Arn" \
			                                            ] \
			                                        } \
			                                    ],  \
			                                    "Effect": "Allow" \
			                                },  \
			                                { \
			                                    "Action": [ \
			                                        "logs:CreateLogGroup",  \
			                                        "logs:CreateLogStream",  \
			                                        "logs:PutLogEvents" \
			                                    ],  \
			                                    "Resource": "arn:aws:logs:*:*:*",  \
			                                    "Effect": "Allow" \
			                                },  \
			                                { \
			                                    "Action": [ \
			                                        "cloudtrail:DescribeTrails",  \
			                                        "cloudtrail:CreateTrail",  \
			                                        "cloudtrail:StartLogging" \
			                                    ],  \
			                                    "Resource": [ \
			                                        "*" \
			                                    ],  \
			                                    "Effect": "Allow" \
			                                } \
			                            ] \
			                        } \
			                    } \
			                ],  \
			                "AssumeRolePolicyDocument": { \
			                    "Version": "2012-10-17",  \
			                    "Statement": [ \
			                        { \
			                            "Action": [ \
			                                "sts:AssumeRole" \
			                            ],  \
			                            "Effect": "Allow",  \
			                            "Principal": { \
			                                "Service": [ \
			                                    "lambda.amazonaws.com" \
			                                ] \
			                            } \
			                        } \
			                    ] \
			                } \
			            } \
			        },  \
			        "ConfigRole": { \
			            "Type": "AWS::IAM::Role",  \
			            "Properties": { \
			                "ManagedPolicyArns": [ \
			                    "arn:aws:iam::aws:policy/service-role/AWSConfigRole" \
			                ],  \
			                "Policies": [ \
			                    { \
			                        "PolicyName": "ConfigRolePolicy",  \
			                        "PolicyDocument": { \
			                            "Version": "2012-10-17",  \
			                            "Statement": [ \
			                                { \
			                                    "Action": [ \
			                                        "s3:PutObject" \
			                                    ],  \
			                                    "Resource": { \
			                                        "Fn::Join": [ \
			                                            "",  \
			                                            [ \
			                                                "arn:aws:s3:::",  \
			                                                { \
			                                                    "Ref": "S3BucketConfig" \
			                                                },  \
			                                                "/AWSLogs/",  \
			                                                { \
			                                                    "Ref": "AWS::AccountId" \
			                                                },  \
			                                                "/*" \
			                                            ] \
			                                        ] \
			                                    },  \
			                                    "Effect": "Allow",  \
			                                    "Condition": { \
			                                        "StringLike": { \
			                                            "s3:x-amz-acl": "bucket-owner-full-control" \
			                                        } \
			                                    } \
			                                },  \
			                                { \
			                                    "Action": "config:Put*",  \
			                                    "Resource": "*",  \
			                                    "Effect": "Allow" \
			                                },  \
			                                { \
			                                    "Action": [ \
			                                        "s3:GetBucketAcl" \
			                                    ],  \
			                                    "Resource": { \
			                                        "Fn::Join": [ \
			                                            "",  \
			                                            [ \
			                                                "arn:aws:s3:::",  \
			                                                { \
			                                                    "Ref": "S3BucketConfig" \
			                                                } \
			                                            ] \
			                                        ] \
			                                    },  \
			                                    "Effect": "Allow" \
			                                } \
			                            ] \
			                        } \
			                    } \
			                ],  \
			                "AssumeRolePolicyDocument": { \
			                    "Version": "2012-10-17",  \
			                    "Statement": [ \
			                        { \
			                            "Action": "sts:AssumeRole",  \
			                            "Principal": { \
			                                "Service": "config.amazonaws.com" \
			                            },  \
			                            "Effect": "Allow",  \
			                            "Sid": "" \
			                        } \
			                    ] \
			                } \
			            } \
			        },  \
			        "BackingLambdaConfigLogProcessor": { \
			            "Type": "AWS::Lambda::Function",  \
			            "Properties": { \
			                "Code": { \
			                    "S3Bucket": "nstone-website-test",  \
			                    "S3Key": "4e3261e4051acfa5483346f265284c69" \
			                },  \
			                "Description": "Stream events from an AWS S3 bucket being updated by AWS config to Splunk using HTTP event collector",  \
			                "MemorySize": 512,  \
			                "Environment": { \
			                    "Variables": { \
			                        "SPLUNK_HEC_URL": { \
			                            "Ref": "SplunkHttpEventCollectorURL" \
			                        },  \
			                        "SPLUNK_HEC_TOKEN": { \
			                            "Ref": "ConfigSplunkHttpEventCollectorToken" \
			                        } \
			                    } \
			                },  \
			                "Handler": "index.handler",  \
			                "Role": { \
			                    "Fn::GetAtt": [ \
			                        "BackingLambdaExecutionConfigLogProcessorRole",  \
			                        "Arn" \
			                    ] \
			                },  \
			                "Timeout": 300,  \
			                "Runtime": "nodejs6.10" \
			            } \
			        },  \
			        "CloudTrailSanitisationResults": { \
			            "Type": "Custom::CloudTrailSanitisationResults",  \
			            "Properties": { \
			                "CloudTrailName": { \
			                    "Ref": "CloudTrailName" \
			                },  \
			                "RoleARN": { \
			                    "Fn::GetAtt": [ \
			                        "BackingLambdaExecutionCloudTrailLogProcessor",  \
			                        "Arn" \
			                    ] \
			                },  \
			                "ServiceToken": { \
			                    "Fn::GetAtt": [ \
			                        "CloudTrailSanitiser",  \
			                        "Arn" \
			                    ] \
			                },  \
			                "S3BucketCloudTrailArn": { \
			                    "Fn::GetAtt": [ \
			                        "S3BucketCloudTrail",  \
			                        "Arn" \
			                    ] \
			                },  \
			                "S3BucketCloudTrail": { \
			                    "Ref": "S3BucketCloudTrail" \
			                },  \
			                "NotificationConfiguration": { \
			                    "LambdaFunctionConfigurations": [ \
			                        { \
			                            "LambdaFunctionArn": { \
			                                "Fn::GetAtt": [ \
			                                    "BackingLambdaCloudTrailLogProcessor",  \
			                                    "Arn" \
			                                ] \
			                            },  \
			                            "Events": [ \
			                                "s3:ObjectCreated:*" \
			                            ] \
			                        } \
			                    ] \
			                } \
			            },  \
			            "DependsOn": [ \
			                "CloudTrailBucketPolicy" \
			            ] \
			        } \
			    },  \
			    "Description": "Template for AWS data ingest into Splunk using an HTTP Event Collector logger",  \
			    "Parameters": { \
			        "CloudWatchSplunkHttpEventCollectorToken": { \
			            "Type": "String",  \
			            "Description": "The enabled HEC token on the Splunk environment for the aws:cloudwatch sourcetype. (format - 12345678-qwer-asdf-zxcv-123456789qwe)" \
			        },  \
			        "CloudTrailName": { \
			            "Type": "String",  \
			            "Description": "The name of the new CloudTrail trail that will be generated and sent to Splunk once this template is deployed." \
			        },  \
			        "CloudTrailSplunkHttpEventCollectorToken": { \
			            "Type": "String",  \
			            "Description": "The enabled HEC token on the Splunk environment for the aws:cloudtrail sourcetype. (format - 12345678-qwer-asdf-zxcv-123456789qwe)" \
			        },  \
			        "SplunkHttpEventCollectorURL": { \
			            "Type": "String",  \
			            "Description": "The HEC endpoint server and port (default 8088) of the the Splunk environment which will receive AWS data. (format - https://server:port/services/collector)" \
			        },  \
			        "ConfigSplunkHttpEventCollectorToken": { \
			            "Type": "String",  \
			            "Description": "The enabled HEC token on the Splunk environment for the aws:config sourcetype. (format - 12345678-qwer-asdf-zxcv-123456789qwe)" \
			        } \
			    } \
			}');

		//console.log(template);
		save_to_local_template();
		//console.log("hello");
		if (!$('#AWS_Config').is(":checked"))
		{
		  	delete template["Parameters"]["ConfigSplunkHttpEventCollectorToken"]
			delete template["Resources"]["S3BucketConfig"]
			delete template["Resources"]["ConfigRole"]
			delete template["Resources"]["BackingLambdaExecutionConfigLogProcessorRole"]
			delete template["Resources"]["BackingLambdaConfigLogProcessor"]
			delete template["Resources"]["ConfigBucketConfiguration"]
			delete template["Resources"]["ConfigUpdateBucketConfiguration"]
			delete template["Resources"]["ConfigBucketPermission"]
			delete template["Resources"]["ConfigurationRecorderLambdaExecutionRole"]
			delete template["Resources"]["ConfigurationRecorderSanitiser"]
			delete template["Resources"]["ConfigurationRecorderSanitizationLambdaExecutionRole"]
			delete template["Resources"]["ConfigurationRecorderSanitisationResults"]
		}

		if (!$('#AWS_CT').is(":checked"))
		{
		  	delete template["Parameters"]["CloudTrailSplunkHttpEventCollectorToken"]
			delete template["Parameters"]["CloudTrailName"]
			delete template["Resources"]["S3BucketCloudTrail"]
			delete template["Resources"]["CloudTrailBucketPolicy"]
			delete template["Resources"]["BackingLambdaExecutionCloudTrailLogProcessor"]
			delete template["Resources"]["BackingLambdaCloudTrailLogProcessor"]
			delete template["Resources"]["CloudTrailBucketConfiguration"]
			delete template["Resources"]["CloudTrailUpdateBucketConfiguration"]
			delete template["Resources"]["CloudTrailBucketPermission"]
			delete template["Resources"]["CloudTrailLambdaExecutionRole"]
			delete template["Resources"]["CloudTrailSanitiser"]
			delete template["Resources"]["CloudTrailSanitizationLambdaExecutionRole"]
			delete template["Resources"]["CloudTrailSanitisationResults"]

		}

		if (!$('#AWS_CWM').is(":checked"))
		{
		  	delete template["Parameters"]["CloudWatchSplunkHttpEventCollectorToken"]
			delete template["Resources"]["TrumpetDynamoDBTable"]
			delete template["Resources"]["BackingLambdaCloudWatchMetricsProcessor"]
			delete template["Resources"]["BackingLambdaExecutionRoleCloudWatchMetricsProcessor"]
			delete template["Resources"]["EventRule"]
			delete template["Resources"]["PermissionForEventsToInvokeLambda"]
		}

		console.log(template);
		save_to_local_template();
	});

	$('#wipeData').click(function () {
	    items = []
	    //make_list();
	    save_to_local_json();
	});

	$('#wipeTemplate').click(function () {
	    template = {}
	    //make_list();
	    save_to_local_template();
	    read_from_local_template();
	});

	(function () {
	var textFile = null,
	  makeTextFile = function (text) {
	    var data = new Blob([text], {type: 'text/plain'});

	    // If we are replacing a previously generated file we need to
	    // manually revoke the object URL to avoid memory leaks.
	    if (textFile !== null) {
	      window.URL.revokeObjectURL(textFile);
	    }

	    textFile = window.URL.createObjectURL(data);

	    return textFile;
	  };


	  var create = document.getElementById('doesEverything'),
	    textbox = document.getElementById('textbox');

	  create.addEventListener('click', function () {
	    var link = document.getElementById('downloadlink');
	    link.href = makeTextFile(JSON.stringify(template));
	    link.style.display = 'block';
	  }, false);
	})();
});
