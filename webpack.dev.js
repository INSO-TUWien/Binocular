'use strict';

import { merge } from 'webpack-merge';
import * as commonConfig from './webpack.common.js';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const opts = {
  ENV: 'development',
};

export default merge(commonConfig, {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  entry: [require.resolve('react-dev-utils/webpackHotDevClient'), require.resolve('react-error-overlay')],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [{ loader: 'ifdef-loader', options: opts }],
      },
    ],
  },
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
