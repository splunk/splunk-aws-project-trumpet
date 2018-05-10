const aws = require('aws-sdk');
const async = require('async');
const SplunkLogger = require('splunk-logging').Logger;

const configureLogger = (context, callback) => {
    // Override SplunkLogger default formatter
    Logger.eventFormatter = (event) => {
        // Enrich event only if it is an object
        if (typeof event === 'object' && !Object.prototype.hasOwnProperty.call(event, 'awsRequestId')) {
            // Add awsRequestId from Lambda context for request tracing
            event.awsRequestId = context.awsRequestId; // eslint-disable-line no-param-reassign
        }
        return event;
    }

    // Set common error handler for logger.send() and logger.flush()
    Logger.error = (error, payload) => {
        console.log('error', error, 'context', payload);
        callback(error);
    }
}

var config = {
    url: process.env.SPLUNK_HEC_URL,
    token: process.env.SPLUNK_HEC_TOKEN,
    maxBatchCount: 1,
    maxRetries: 2
};

var Logger = new SplunkLogger(config);
var cloudwatch = new aws.CloudWatch();
var dynamodb = new aws.DynamoDB();
var periodicity = 5;
var periodicity_seconds = periodicity*60;
var namespace = 'AWS/EC2';
var region = process.env.AWS_REGION;
var start = new Date() / 1000;


function get_metric_and_send_to_splunk(event, context, highwater, new_highwater, new_highwater_clean_bounds, metric_name, dimension, ddb_metric_key) {
  // Kill function if less than 10 seconds left
  // var current = new Date() / 1000;
  // if (current - start >= periodicity_seconds-10) {
  //    return
  // }

  var cweParams = {
    EndTime: new_highwater_clean_bounds,
    Dimensions: dimension,
    MetricName: metric_name,
    Namespace: namespace,
    Period: periodicity_seconds,
    Statistics: ["Minimum", "Maximum", "Average", "SampleCount", "Sum"],
    StartTime: parseInt(highwater)
  };

  cloudwatch.getMetricStatistics(cweParams, function(err, metric_data) {
    if (err) {
      console.log(err, err.stack);
    } else {
      var metric_dimension_string = metric_name + "$$$" + dimension[0].Name + "$$$" + dimension[0].Value
      var dimension_list = [];
      for (var i = 0, len = dimension.length; i < len; i++) {
        dimension_list.push(dimension[0].Name + "=[" + dimension[0].Value + "]")
      }
      if (metric_data.Datapoints.length > 0) {
        metric_data.Datapoints[0]["period"] = periodicity_seconds;
        metric_data.Datapoints[0]["account_id"] = context.invokedFunctionArn.match(/\d{3,}/)[0];
        metric_data.Datapoints[0]["metric_name"] = metric_name;
        metric_data.Datapoints[0]["metric_dimensions"] = dimension_list.join();
        var second_time = new Date(metric_data.Datapoints[0]["Timestamp"]).getTime() / 1000;
        delete metric_data.Datapoints[0]["Timestamp"];

        send_to_splunk(event, context, second_time, JSON.stringify(metric_data.Datapoints[0]), metric_dimension_string, highwater, new_highwater, new_highwater_clean_bounds, metric_name, dimension, ddb_metric_key);
      } else {
        // still need to update highwater and potentially recurse
        var updateParams = {
          Key: {
            "metric_dimension": {
              "S" : metric_dimension_string
            }
          },
          UpdateExpression: "set highwater = :x",
          ExpressionAttributeValues: {
            ":x": {"S": new_highwater.toString()}
          },
          TableName: "splunk_metrics_highwater"
        };

        dynamodb.updateItem(updateParams, function(err, data) {
          if (err) {
            console.log(err, err.stack);
          } else {
              var current = new Date() / 1000;
              if (current - new_highwater > periodicity_seconds) {
                //recurse here to update as much as possible
                get_metric_and_send_to_splunk(event, context, new_highwater, new_highwater + periodicity_seconds, new_highwater + periodicity_seconds-1, metric_name, dimension, ddb_metric_key)
              }
          }
        });
      }
    }
  });
  // TODO Batch metric requests? - Tricky because need to parse results after to find
}

function send_to_splunk(event, context, second_time, metric_data, metric_dimension_string, highwater, new_highwater, new_highwater_clean_bounds, metric_name, dimension, ddb_metric_key) {
  configureLogger(context);

  var payload = { message: metric_data,
                  metadata: {
                    time: second_time,
                    host: "aws_cloudwatch_lambda",
                    source: region + ":" + namespace
                  }
                };

  //console.log("Sending payload", payload);

  Logger.send(payload, function(err, resp, body) {
      if (err) {
        console.log(err, err.stack);
      } else {
        console.log("Response from Splunk", body);

        //console.log("Update DDB with new highwater");
        var updateParams = {
          Key: {
            "metric_dimension": {
              "S" : metric_dimension_string
            }
          },
          UpdateExpression: "set highwater = :x",
          ExpressionAttributeValues: {
            ":x": {"S": new_highwater.toString()}
          },
          TableName: "splunk_metrics_highwater"
        };

        dynamodb.updateItem(updateParams, function(err, data) {
          if (err) {
            console.log(err, err.stack);
          } else {
              var current = new Date() / 1000;
              if (current - new_highwater > periodicity_seconds) {
                //recurse here to update as much as possible
                get_metric_and_send_to_splunk(event, context, new_highwater, new_highwater + periodicity_seconds, new_highwater + periodicity_seconds-1, metric_name, dimension, ddb_metric_key)
              }
          }
        });
      }
  });
}

exports.handler = (event, context, callback) => {
    var params = {
      Namespace: namespace
    };
    cloudwatch.listMetrics(params, function(err, listMetricsData) {
      if (err) {
        console.log(err, err.stack);
      }
      else {

        async.each(listMetricsData.Metrics,
          function(item, callback){
            var metric_name = item.MetricName;
            var dimension = item.Dimensions;

            var ddb_metric_key = metric_name + "$$$" + dimension[0].Name + "$$$" + dimension[0].Value
            var params = {
              Key: {
               "metric_dimension": { "S" : ddb_metric_key }
              },
              TableName: "splunk_metrics_highwater"
            };
            // TODO Batch this call
            dynamodb.getItem(params, function(err, itemData) {
              if (err) {
                console.log(err, err.stack);
              } else {
                  // if the metric has not been requested before, return will be empty
                if (Object.keys(itemData).length === 0) {
                  /*
                      Creating artificial highwater mark

                      Because request time bounds are inclusive on both sides, need to shave a second off highwater mark timestamp + 5 mins to ensure events are never duplicated
                      This second will be requested as part of the subsequent scheduled lambda call
                      If periodicity was high - there could be maximal latency - but likely not an issue since metric periodicity is being factored in
                  */

                  var seconds = new Date() / 1000; // time in seconds (epoch)
                  var div = Math.floor(seconds/periodicity_seconds);  // number of 5 minute chunks in time in seconds
                  var closest_five_bucket = div * periodicity_seconds; // closest five minute bucket to current date (rounded down)
                  var closest_available_highwater = closest_five_bucket - periodicity_seconds; //  closest start of 5 min bucket where 5 mins has fully elapssd and 1 minute latency buffer considered

                  var highwater = closest_available_highwater; // rename for future code reuse
                  var new_highwater = parseInt(highwater, 10) + periodicity_seconds; // + five minutes in epoch time
                  var new_highwater_clean_bounds = new_highwater - 1;

                  // Grab metric and send to Splunk
                  get_metric_and_send_to_splunk(event, context, highwater, new_highwater, new_highwater_clean_bounds, metric_name, dimension, ddb_metric_key)
                } else {
                  // console.log(itemData)
                  // Metric for dimension exists in the table, grab most recent highwater
                  var highwater = itemData.Item.highwater.S;
                  var new_highwater = parseInt(highwater, 10) + periodicity_seconds;// + five minutes in epoch time
                  var new_highwater_clean_bounds = new_highwater - 1;

                  // Grab metric and send to Splunk
                  get_metric_and_send_to_splunk(event, context, highwater, new_highwater, new_highwater_clean_bounds, metric_name, dimension, ddb_metric_key)
                }
              }
            });
          }
        );
      }
    });
};