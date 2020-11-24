'use strict';

const { merge } = require('webpack-merge');
const commonConfig = require('./webpack.common');

module.exports = merge(commonConfig, {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: [
    require.resolve('react-dev-utils/webpackHotDevClient'),
    require.resolve('react-error-overlay'),
  ],
  devServer: {
    inline: true,
    watchContentBase: true,
    contentBase: './ui',
    publicPath: '/assets/',
    hot: true,
    historyApiFallback: true,
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
