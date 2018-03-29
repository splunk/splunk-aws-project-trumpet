// dependencies
var AWS = require('aws-sdk');
var response = require('cfn-response');
var configservice = new AWS.ConfigService();
var current_region = process.env.AWS_REGION;

exports.handler = function(event, context, callback) {
    console.log('Checking if a configuration recorder exists');
    configservice.describeConfigurationRecorders(null, function(err, data) {
        if (err) {
            console.log(err, err.stack);
            response.send(event, context, response.FAILED, {
                'Status': 'NEW'
            });
        } else {
            if(data.ConfigurationRecorders.length > 0) {
                // successful response
                var configurationRecorders = data;
                console.log('Found Configuration Recoder: ' + configurationRecorders.ConfigurationRecorders[0].name);
                console.log('Checking for the existence of a Delivery Channel');

                configservice.describeDeliveryChannels(null, function(err, data) {
                    if (err) {
                        console.log(err, err.stack);
                        response.send(event, context, response.FAILED, {
                            'Status': 'NEW'
                        });
                    } else {
                        if(data.DeliveryChannels.length > 0){
                            console.log('There is an existing delivery channel, checking if it has an s3 bucket');
                            deliveryChannels = data;
                            deliveryChannel = deliveryChannels.DeliveryChannels[0];
                            if (deliveryChannel.s3BucketName) {
                                if (deliveryChannel.s3KeyPrefix) {
                                    console.log('Bucket has a prefix. Full bucket name: ' + deliveryChannel.s3BucketName + '\\' + deliveryChannel.s3KeyPrefix);
                                    response.send(event, context, response.SUCCESS, {
                                        'Status': 'EXISTING',
                                        'ConfigurationRecorder': configurationRecorders.ConfigurationRecorders[0].name,
                                        'FinalS3BucketConfig': deliveryChannel.s3BucketName + '\\' + deliveryChannel.s3KeyPrefix,
                                        'FinalS3BucketConfigArn': "arn:aws:s3:::" + deliveryChannel.s3BucketName + '\\' + deliveryChannel.s3KeyPrefix
                                    });
                                } else {
                                    console.log('Bucket does not have a prefix. Full bucket name: ' + deliveryChannel.s3BucketName);
                                    response.send(event, context, response.SUCCESS, {
                                        'Status': 'EXISTING',
                                        'ConfigurationRecorder': configurationRecorders.ConfigurationRecorders[0].name,
                                        'FinalS3BucketConfig': deliveryChannel.s3BucketName,
                                        'FinalS3BucketConfigArn': "arn:aws:s3:::" + deliveryChannel.s3BucketName
                                    });
                                }
                            } else {
                                console.log('Recorder exists but delivery channel is only SNS. Attach s3 Bucket to delivery channel configuration.');
                                var dcParams = {
                                    DeliveryChannel: {
                                        name: "CFN_delivery_channel",
                                        configSnapshotDeliveryProperties: {
                                            deliveryFrequency: "One_Hour"
                                        },
                                        s3BucketName: event.ResourceProperties.S3BucketConfig
                                    }
                                };
                                console.log("Creating delivery channel");
                                configservice.putDeliveryChannel(dcParams, function(err, data) {
                                    if (err) {
                                        console.log(err, err.stack);
                                        response.send(event, context, response.FAILED, {
                                            'Status': 'NEW'
                                        });
                                    } else {
                                        console.log(data);
                                        var params = {
                                            ConfigurationRecorderName: event.ResourceProperties.ConfigRecorderName
                                        };
                                        configservice.startConfigurationRecorder(params, function(err, data) {
                                            if (err) {
                                                console.log(err, err.stack);
                                                response.send(event, context, response.FAILED, {
                                                    'Status': 'NEW'
                                                });
                                            } else {
                                                console.log(data);
                                                response.send(event, context, response.SUCCESS, {
                                                    'Status': 'NEW',
                                                    'FinalS3BucketConfig': event.ResourceProperties.S3BucketConfig,
                                                    'FinalS3BucketConfigArn': event.ResourceProperties.S3BucketConfigArn
                                                });
                                            }
                                        });
                                    }
                                });
                                response.send(event, context, response.SUCCESS, {
                                    'Status': 'NEW',
                                    'FinalS3BucketConfig': event.ResourceProperties.S3BucketConfig ,
                                    'FinalS3BucketConfigArn': event.ResourceProperties.S3BucketConfigArn
                                });
                            }
                        } else {
                            console.log('Recorder exists but no delivery channel. Deleting old recorder and creating a new recorder and a new delivery channel.');
                            console.log('Deleting the recorder');

                            var params = {
                              ConfigurationRecorderName: configurationRecorders.ConfigurationRecorders[0].name
                            };
                            configservice.deleteConfigurationRecorder(params, function(err, data) {
                                if (err) {
                                    console.log(err, err.stack);
                                    response.send(event, context, response.FAILED, {
                                        'Status': 'NEW'
                                    });
                                } else {
                                    console.log(data);
                                    var crParamsDeletedRecorder = {};
                                    console.log('Checking to see if if we are in us-east-1. If so, we will include global resources.');

                                    if (current_region == "us-east-1") {
                                        console.log('We are in us-east-1. Setting includeGlobalResouceTypes to true.');
                                        crParamsDeletedRecorder = {
                                            ConfigurationRecorder: {
                                                name: event.ResourceProperties.ConfigRecorderName,
                                                recordingGroup: {
                                                    allSupported: true,
                                                    includeGlobalResourceTypes: true
                                                },
                                                roleARN: event.ResourceProperties.RecorderRoleArn
                                            }
                                        };
                                    } else {
                                        console.log('We are not in us-east-1. Setting includeGlobalResouceTypes to false.');
                                        crParamsDeletedRecorder = {
                                            ConfigurationRecorder: {
                                                name: event.ResourceProperties.ConfigRecorderName,
                                                recordingGroup: {
                                                    allSupported: true,
                                                    includeGlobalResourceTypes: false
                                                },
                                                roleARN: event.ResourceProperties.RecorderRoleArn
                                            }
                                        };
                                    }

                                    console.log('Creating new configuration recorder');
                                    configservice.putConfigurationRecorder(crParamsDeletedRecorder, function(err, data) {
                                        if (err) {
                                            console.log(err, err.stack);
                                            response.send(event, context, response.FAILED, {
                                                'Status': 'NEW'
                                            });
                                        } else {
                                            console.log(data);
                                            console.log('Adding the delivery channel');
                                            var dcParams = {
                                                DeliveryChannel: {
                                                    name: "CFN_delivery_channel",
                                                    configSnapshotDeliveryProperties: {
                                                        deliveryFrequency: "One_Hour"
                                                    },
                                                    s3BucketName: event.ResourceProperties.S3BucketConfig
                                                }
                                            };
                                            console.log("Creating delivery channel");
                                            configservice.putDeliveryChannel(dcParams, function(err, data) {
                                                if (err) {
                                                    console.log(err, err.stack);
                                                    response.send(event, context, response.FAILED, {
                                                        'Status': 'NEW'
                                                    });
                                                } else {
                                                    console.log(data);
                                                    var params = {
                                                        ConfigurationRecorderName: event.ResourceProperties.ConfigRecorderName
                                                    };
                                                    configservice.startConfigurationRecorder(params, function(err, data) {
                                                        if (err) {
                                                            console.log(err, err.stack);
                                                            response.send(event, context, response.FAILED, {
                                                                'Status': 'NEW'
                                                            });
                                                        } else {
                                                            console.log(data);
                                                            response.send(event, context, response.SUCCESS, {
                                                                'Status': 'NEW',
                                                                'FinalS3BucketConfig': event.ResourceProperties.S3BucketConfig,
                                                                'FinalS3BucketConfigArn': event.ResourceProperties.S3BucketConfigArn
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    }
                })

            } else {
                console.log('No configuration recorded exists');

                configservice.describeDeliveryChannels(null, function(err, data) {
                    if (err) {
                        console.log(err, err.stack);
                        response.send(event, context, response.FAILED, {
                            'Status': 'NEW'
                        });
                    } else {
                        console.log(data);
                        if (data.DeliveryChannels.length > 0) {
                            console.log('Old delivery channel exists. Deleting old channel and creating new configuration recorder and delivery channel');
                            var params = {
                                DeliveryChannelName: data.DeliveryChannels[0].name
                            };
                            configservice.deleteDeliveryChannel(params, function(err, data) {
                                if (err) {
                                    console.log(err, err.stack);
                                    response.send(event, context, response.FAILED, {
                                        'Status': 'NEW'
                                    });
                                } else {
                                    console.log(data);
                                    var crParamsNewRecorder = {};
                                    console.log('Checking to see if if we are in us-east-1. If so, we will include global resources. includeGlobalResourceTypes set to true.');

                                    if (current_region == "us-east-1") {
                                        console.log('We are in us-east-1. Setting includeGlobalResouceTypes to true.');
                                        crParamsNewRecorder = {
                                            ConfigurationRecorder: {
                                                name: event.ResourceProperties.ConfigRecorderName,
                                                recordingGroup: {
                                                    allSupported: true,
                                                    includeGlobalResourceTypes: true
                                                },
                                                roleARN: event.ResourceProperties.RecorderRoleArn
                                            }
                                        };
                                    } else {
                                        console.log('We are not in us-east-1. Setting includeGlobalResouceTypes to false.');
                                        crParamsNewRecorder = {
                                            ConfigurationRecorder: {
                                                name: event.ResourceProperties.ConfigRecorderName,
                                                recordingGroup: {
                                                    allSupported: true,
                                                    includeGlobalResourceTypes: false
                                                },
                                                roleARN: event.ResourceProperties.RecorderRoleArn
                                            }
                                        };
                                    }

                                    configservice.putConfigurationRecorder(crParamsNewRecorder, function (err, data) {
                                        if (err) {
                                            console.log(err, err.stack);
                                            response.send(event, context, response.FAILED, {
                                                'Status': 'NEW'
                                            });
                                        } else {
                                            console.log(data);
                                            var dcParams = {
                                                DeliveryChannel: {
                                                    name: "CFN_delivery_channel",
                                                    configSnapshotDeliveryProperties: {
                                                        deliveryFrequency: "One_Hour"
                                                    },
                                                    s3BucketName: event.ResourceProperties.S3BucketConfig
                                                }
                                            };
                                            configservice.putDeliveryChannel(dcParams, function (err, data) {
                                                if (err) {
                                                    console.log(err, err.stack);
                                                    response.send(event, context, response.FAILED, {
                                                        'Status': 'NEW'
                                                    });
                                                } else {
                                                    console.log(data);
                                                    var params = {
                                                        ConfigurationRecorderName: event.ResourceProperties.ConfigRecorderName
                                                    };
                                                    configservice.startConfigurationRecorder(params, function (err, data) {
                                                        if (err) {
                                                            console.log(err, err.stack);
                                                            response.send(event, context, response.FAILED, {
                                                                'Status': 'NEW'
                                                            });
                                                        } else {
                                                            console.log(data);
                                                            response.send(event, context, response.SUCCESS, {
                                                                'Status': 'NEW',
                                                                'FinalS3BucketConfig': event.ResourceProperties.S3BucketConfig,
                                                                'FinalS3BucketConfigArn': event.ResourceProperties.S3BucketConfigArn
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        } else {
                            console.log('No old delivery channel. Creating new configuration recorder and delivery channel');
                            var crParams = {
                                ConfigurationRecorder: {
                                    name: event.ResourceProperties.ConfigRecorderName,
                                    recordingGroup: {
                                        allSupported: true,
                                        includeGlobalResourceTypes: true
                                    },
                                    roleARN: event.ResourceProperties.RecorderRoleArn
                                }
                            };
                            configservice.putConfigurationRecorder(crParams, function(err, data) {
                                if (err) {
                                    console.log(err, err.stack);
                                    response.send(event, context, response.FAILED, {
                                        'Status': 'NEW'
                                    });
                                } else {
                                    console.log(data);
                                    var dcParams = {
                                        DeliveryChannel: {
                                            name: "CFN_delivery_channel",
                                            configSnapshotDeliveryProperties: {
                                                deliveryFrequency: "One_Hour"
                                            },
                                            s3BucketName: event.ResourceProperties.S3BucketConfig
                                        }
                                    };
                                    configservice.putDeliveryChannel(dcParams, function(err, data) {
                                        if (err) {
                                            console.log(err, err.stack);
                                            response.send(event, context, response.FAILED, {
                                                'Status': 'NEW'
                                            });
                                        } else {
                                            console.log(data);
                                            var params = {
                                                ConfigurationRecorderName: event.ResourceProperties.ConfigRecorderName
                                            };
                                            configservice.startConfigurationRecorder(params, function(err, data) {
                                                if (err) {
                                                    console.log(err, err.stack);
                                                    response.send(event, context, response.FAILED, {
                                                        'Status': 'NEW'
                                                    });
                                                } else {
                                                    console.log(data);
                                                    response.send(event, context, response.SUCCESS, {
                                                        'Status': 'NEW',
                                                        'FinalS3BucketConfig': event.ResourceProperties.S3BucketConfig,
                                                        'FinalS3BucketConfigArn': event.ResourceProperties.S3BucketConfigArn
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
            }
        }
    });
};