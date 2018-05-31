const testRunner = require('@splunk/karma-unit-test-runner');

module.exports = config => {
    testRunner.config(config, {
        basePath: __dirname,
        testRegexp: '(.+)\\.unit(?:\\.jsx?)$',
        testApps: { SplunkAwsConfigurationWebsite: { path: 'src' } },
    });
    config.browsers = ['jsdom'];
};
