const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const baseConfig = require('@splunk/webpack-configs').default;

module.exports = webpackMerge(baseConfig, {});
