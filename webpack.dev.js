'use strict';

const { merge } = require('webpack-merge');
const commonConfig = require('./webpack.common');

module.exports = merge(commonConfig, {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: [require.resolve('react-dev-utils/webpackHotDevClient'), require.resolve('react-error-overlay')],
  devServer: {
    static: {
      directory: 'ui',
      watch: true,
    },
    hot: true,
    historyApiFallback: true,
    allowedHosts: 'all',
    proxy: {
      '/api': {
        target: 'http://localhost:48763/',
        secure: false,
      },
      '/graphQl': {
        target: 'http://localhost:48763/',
        secure: false,
      },
      '/wsapi': {
        target: 'ws://localhost:48763',
        ws: true,
      },
    },
  },
});
