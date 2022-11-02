'use strict';

const { merge } = require('webpack-merge');
const commonConfig = require('./webpack.common');
const path = require('path');

module.exports = merge(commonConfig, {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  entry: [require.resolve('babel-polyfill'), './ui/src/index'],
  output: {
    path: path.join(__dirname, '/dist'),
    pathinfo: true,
    filename: 'assets/bundle.js',
  },
});
