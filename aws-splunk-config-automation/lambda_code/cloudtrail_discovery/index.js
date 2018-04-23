// dependencies
var AWS = require('aws-sdk');
var response = require('cfn-response');
var cloudtrail = new AWS.CloudTrail();
var current_region = process.env.AWS_REGION;

function check_region_create_trail_and_start(event, context) {
    console.log('No valid trails exist in this region. Creating a new trail');
    console.log('Checking if we are in us-east-1. If so, we will turn on global service API call monitoring. IncludeGlobalServiceEvents set to true.');
    var createParamsTrailsExist = {};
    if (current_region == "us-east-1") {
        console.log('Region is us-east-1. IncludeGlobalServiceEvents set to true.');
        createParamsTrailsExist = {
            Name: event.ResourceProperties.CloudTrailName,
            S3BucketName: event.ResourceProperties.S3BucketCloudTrail,
            IncludeGlobalServiceEvents: true,
            IsMultiRegionTrail: false
        };
    } else {
        console.log('Region is not us-east-1. IncludeGlobalServiceEvents set to false.');
        createParamsTrailsExist = {
            Name: event.ResourceProperties.CloudTrailName,
            S3BucketName: event.ResourceProperties.S3BucketCloudTrail,
            IncludeGlobalServiceEvents: false,
            IsMultiRegionTrail: false
        };
    }
    cloudtrail.createTrail(createParamsTrailsExist, function(err, data) {
        if (err) {
            console.log(err);
            response.send(event, context, response.FAILED, {
                'Status': 'FAILED'
            });
        } else {
            console.log(data);
            // Trail created, start trail and return to CFN
            var params = {
                Name: data.Name
            };
            cloudtrail.startLogging(params, function(err, data) {
                if (err) {
                    console.log(err, err.stack);
                    response.send(event, context, response.FAILED, {
                        'Status': 'FAILED'
                    });
                    return false;
                }
                else {
                    console.log(data);
                    response.send(event, context, response.SUCCESS, {
                        'Status': 'SUCCESS',
                        'FinalS3BucketCloudTrail': event.ResourceProperties.S3BucketCloudTrail,
                        'FinalS3BucketCloudTrailArn': event.ResourceProperties.S3BucketCloudTrailArn
                    });
                }
            });
        }
    });
}

exports.handler = function(event, context, callback) {
    console.log(event);

    var describeParams = {
      includeShadowTrails: false,
      trailNameList: []
    };
    console.log("Checking what potentially valid trails exist in this region");
    cloudtrail.describeTrails(describeParams, function(err, data) {
        if (err) {
            console.log(err, err.stack);
            response.send(event, context, response.FAILED, {
                'Status': 'FAILED'
            });
        } else {
            console.log(data);
            if (data.trailList.length > 0) {
                console.log("Checking if any of the existing trails match requirements");
                var new_trail = true;
                data.trailList.every(function(element) {
                    console.log(element);
                    if (element.HomeRegion == current_region && !element.IsMultiRegionTrail) {
                        console.log("Requirement one passed. Trail is regional only for the current region");
                        if (current_region != "us-east-1") {
                            if (!element.IncludeGlobalServiceEvents) {
                                console.log("Requirement two passed. Non us-east-1 trail does not include AWS API calls from AWS global services such as IAM");
                                console.log("Usable trail found, returning bucket details to CloudFormation");
                                response.send(event, context, response.SUCCESS, {
                                    'Status': 'SUCCESS',
                                    'FinalS3BucketCloudTrail': element.S3BucketName,
                                    'FinalS3BucketCloudTrailArn': "arn:aws:s3:::" + element.S3BucketName
                                });
                                new_trail = false;
                                return false;
                            }
                        } else {
                            // We are in us-east-1
                            if (element.IncludeGlobalServiceEvents) {
                                console.log("Usable trail found, returning bucket details to CloudFormation");
                                response.send(event, context, response.SUCCESS, {
                                    'Status': 'SUCCESS',
                                    'FinalS3BucketCloudTrail': element.S3BucketName,
                                    'FinalS3BucketCloudTrailArn': "arn:aws:s3:::" + element.S3BucketName
                                });
                                new_trail = false;
                                return false;
                            }
                        }
                    }
                });
                // No valid trails exist in this region
                if (new_trail) {
                    check_region_create_trail_and_start(event, context);
                }
                // Trail is regional only
            } else {
                // No trails exist in this region
                check_region_create_trail_and_start(event, context)
            }
        }
    });
};