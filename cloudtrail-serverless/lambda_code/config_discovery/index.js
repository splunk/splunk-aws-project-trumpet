// dependencies
var AWS = require('aws-sdk');
var response = require('cfn-response');
var configservice = new AWS.ConfigService();
exports.handler = function(event, context, callback) {

    console.log('Checking if a configuration recorder exists');
    configservice.describeConfigurationRecorders(null, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
            if(data.ConfigurationRecorders.length > 0){
                // successful response",
                var configurationRecorders = data;
                console.log('Found Configuration Recoder: ' + configurationRecorders.ConfigurationRecorders[0].name);
                console.log('Checking for the existence of a Delivery Channel');
                configservice.describeDeliveryChannels(null, function(err, data) {
                    if (err) console.log(err, err.stack); // an error occurred",
                    else{
                        if(data.DeliveryChannels.length > 0){
                            console.log('There is a Delivery Channel, let\'s check if it has an s3 bucket');
                            deliveryChannels = data;
                            if (deliveryChannels.s3BucketName) {
                                console.log('S3 Bucket Delivey channel found. Return it to the template.');
                                if (deliveryChannels.s3KeyPrefix) {
                                    console.log('Bucket has a prefix. Full bucket name: ' + deliveryChannels.s3BucketName + '\\' + deliveryChannels.s3KeyPrefix);
                                    response.send(event, context, response.SUCCESS, {'Status': 'crE_dcE', 'ConfigurationRecorder': configurationRecorders.ConfigurationRecorders[0].name, 'BucketName': deliveryChannels.s3BucketName + '\\' + deliveryChannels.s3KeyPrefix });
                                } else {
                                    console.log('Bucket does not have a prefix. Full bucket name: ' + deliveryChannels.s3BucketName);
                                    response.send(event, context, response.SUCCESS, {
                                        'Status': 'crE_dcE',
                                        'ConfigurationRecorder': configurationRecorders.ConfigurationRecorders[0].name,
                                        'BucketName': deliveryChannels.s3BucketName
                                    });
                                }
                            } else {
                                console.log('Recorder exists but delivery channel is only SNS. Attach s3 Bucket to delivery channel configuration.');
                                response.send(event, context, response.SUCCESS, { 'Status': 'crE_dcE' })
                            }
                        } else {
                            console.log('Recorder exists but no delivery channel. Tell template to create a new delivery channel.');
                            console.log('Updating the IAM role');
                            // Most complex case -- must retrieve current role and merge with new role to create a combined role to assign to the recorder.",
                            console.log('Adding the delivery channel');
                            var dcParams = {
                                DeliveryChannel: {
                                    configSnapshotDeliveryProperties: {
                                        deliveryFrequency: "One_Hour"
                                    },
                                    s3BucketName: event.S3BucketConfig
                                }
                            };
                            configservice.putDeliveryChannel(dcParams, function(err, data) {
                                if (err) console.log(err, err.stack); // an error occurred",
                                else     console.log(data);           // successful response",
                            });
                            response.send(event, context, response.SUCCESS, { 'Status': 'crE_dcDNE' })
                        }
                    }
                })

                //console.log('Setting the Configuration Recorder\\'s IAM role to the one created by our CFN stack: ' + event.ResourceProperties.RoleARN)
                //var params = {
                //  ConfigurationRecorder: {
                //    name: configurationRecorders.ConfigurationRecorders[0].name,
                //    recordingGroup: configurationRecorders.ConfigurationRecorders[0].recordingGroup,
                //    roleARN: event.ResourceProperties.RoleARN
                //  }
                //};
                //configservice.putConfigurationRecorder(params, function(err, data) {
                //  if (err) console.log(err, err.stack); // an error occurred
                //  else     console.log('Successfully set the Configuration Recorder\\'s IAM role to the one created by our CFN stack');           // successful response
                //});
                //
                //// Return the name of the configuration recorder as one exists
                //response.send(event, context, response.SUCCESS, {'ConfigurationRecorder':configurationRecorders.ConfigurationRecorders[0].name});
            } else {
                console.log('No Configuration Records exist, creating configuration recorder and delivery channel.');
                var crParams = {
                    ConfigurationRecorder: {
                        name: event.ResourceProperties.ConfigRecorderName,
                        recordingGroup: {
                            allSupported: true,
                            includeGlobalResourceTypes: true
                        },
                        roleARN: event.ResourceProperties.RoleARN
                    }
                };
                configservice.putConfigurationRecorder(crParams, function(err, data) {
                    if (err) console.log(err, err.stack); // an error occurred",
                    else     console.log(data);           // successful response",
                });
                var dcParams = {
                    DeliveryChannel: {
                        configSnapshotDeliveryProperties: {
                            deliveryFrequency: "One_Hour"
                        },
                        s3BucketName: event.S3BucketConfig
                    }
                };
                configservice.putDeliveryChannel(dcParams, function(err, data) {
                    if (err) console.log(err, err.stack); // an error occurred",
                    else     console.log(data);           // successful response",
                });
                response.send(event, context, response.SUCCESS, { 'Status': 'crDNE_dcDNE', 'ConfigurationRecorder':'ConfigurationRecorder'});
            }
        }
    });
};