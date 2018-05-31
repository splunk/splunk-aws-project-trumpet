const path = require('path');
const webpackMerge = require('webpack-merge');
const baseComponentConfig = require('@splunk/webpack-configs/component.config').default;

module.exports = webpackMerge(baseComponentConfig, {
    entry: path.join(__dirname, 'src/SplunkAwsConfigurationWebsite.jsx'),
    output: {
        filename: 'SplunkAwsConfigurationWebsite.js',
        path: path.join(__dirname, 'lib'),
    },
});
