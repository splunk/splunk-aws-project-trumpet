/**
 * Stream events from AWS CloudWatch Logs to Splunk
 *
 * This function streams AWS CloudWatch Logs to Splunk using
 * Splunk's HTTP event collector API.
 *
 * Define the following Environment Variables in the console below to configure
 * this function to stream logs to your Splunk host:
 *
 * 1. SPLUNK_HEC_URL: URL address for your Splunk HTTP event collector endpoint.
 * Default port for event collector is 8088. Example: https://host.com:8088/services/collector
 *
 * 2. SPLUNK_HEC_TOKEN: Token for your Splunk HTTP event collector.
 * To create a new token for this Lambda function, refer to Splunk Docs:
 * http://docs.splunk.com/Documentation/Splunk/latest/Data/UsetheHTTPEventCollector#Create_an_Event_Collector_token
 */

'use strict';

const loggerConfig = {
    url: process.env.SPLUNK_HEC_URL,
    token: process.env.SPLUNK_HEC_TOKEN,
};

function customEventFormatter(message, severity) {
    var event = message

    return event;
}

const SplunkLogger = require('splunk-logging').Logger;
const zlib = require('zlib');

const logger = new SplunkLogger(loggerConfig);

logger.eventFormatter = customEventFormatter;

exports.handler = (event, context, callback) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    // CloudTrail Logs data is base64 encoded so decode here
    const payload = new Buffer(event.awslogs.data, 'base64');
    // CloudTrail Logs are gzip compressed so expand here
    zlib.gunzip(payload, (err, result) => {
        if (err) {
            callback(err);
        } else {
            const parsed = JSON.parse(result.toString('ascii'));
            //console.log('Decoded payload:', JSON.stringify(parsed, null, 2));
            let count = 0;
            if (parsed.logEvents) {
                parsed.logEvents.forEach((item) => {
                    if (item.message[0] != "S" && item.message[0] != "E" && item.message[0] != "R") {

                        const parsedEvents = JSON.parse(item.message)
                        parsedEvents.Records.forEach((item) => {
                            /* Alternatively, UNCOMMENT logger call below if you want to override Splunk input settings */
                            /* Log event to Splunk with any combination of explicit timestamp, index, source, sourcetype, and host.
                            - Complete list of input settings available at http://docs.splunk.com/Documentation/Splunk/latest/RESTREF/RESTinput#services.2Fcollector */
                            logger.send({
                                message: item,
                                metadata: {
                                    time: new Date(item.timestamp).getTime() / 1000,
                                    host: 'serverless',
                                    source: `lambda:${context.functionName}`
                                }
                            });

                            count += 1;
                        });
                    };
                });
            }
            // Send all the events in a single batch to Splunk
            logger.flush((error, response) => {
                if (error) {
                    callback(error);
                } else {
                    console.log(`Response from Splunk:\n${response}`);
                    console.log(`Successfully processed ${count} log event(s).`);
                    callback(null, count); // Return number of log events
                }
            });
        }
    });
};
