'use strict';

import { merge } from 'webpack-merge';
import * as commonConfig from './webpack.common.js';
import path from 'path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const opts = {
  ENV: 'offline',
};

export default merge(commonConfig, {
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
