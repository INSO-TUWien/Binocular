'use strict';

const path = require('path');

module.exports = {
  entry: './ui/index.jsx',
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  output: {
    path: path.resolve( __dirname, 'ui/gen/' ),
    filename: 'bundle.js',
    publicPath: '/assets'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react']
        }
      }
    ]
  }
};
