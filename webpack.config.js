'use strict';

const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './ui/index.js',
  output: {
    path: __dirname,
    filename: '/ui/gen/bundle.js',
    publicPath: '/assets/'
  },
  module: {
    loaders: [
      { test: /.jsx?$/, loader: 'babel-loader', exclude: /node_modules/ }
    ]
  }
};
