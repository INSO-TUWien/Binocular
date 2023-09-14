'use strict';

const { merge } = require('webpack-merge');
const commonConfig = require('./webpack.common');
const path = require('path');

const opts = {
  ENV: 'production',
};

module.exports = merge(commonConfig, {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  entry: [require.resolve('babel-polyfill'), './ui/src/index'],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [{ loader: 'ifdef-loader', options: opts }],
      },
    ],
  },
  output: {
    path: path.join(__dirname, '/dist'),
    pathinfo: true,
    filename: 'assets/bundle.js',
  },
});
