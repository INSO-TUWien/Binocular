'use strict';

const webpack = require('webpack');
const path = require('path');

const cssModulesLoader =
  'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]__[hash:base64:5]';

const cssLoaders = [
  // loaders for loading external css
  {
    test: /\.s[ac]ss$/,
    include: path.resolve(__dirname, 'node_modules'),
    exclude: path.resolve(__dirname, 'ui'),
    loaders: ['style-loader', 'css-loader', 'sass-loader']
  },
  {
    test: /\.css$/,
    include: path.resolve(__dirname, 'node_modules'),
    exclude: path.resolve(__dirname, 'ui'),
    loaders: ['style-loader', 'css-loader']
  },

  // loaders for custom css
  {
    test: /\.css$/,
    exclude: path.resolve(__dirname, 'node_modules'),
    loaders: ['style-loader', cssModulesLoader]
  },
  {
    test: /\.s[ac]ss$/,
    exclude: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, 'ui/src/global.scss')
    ],
    loaders: ['style-loader', cssModulesLoader, 'sass-loader']
  },
  {
    test: /global\.scss$/,
    include: path.resolve(__dirname, 'ui/src/global.scss'),
    loaders: ['style-loader', 'css-loader', 'sass-loader']
  }
];

module.exports = {
  devtool: 'eval-source-map',
  entry: {
    app: ['babel-polyfill', 'react-hot-loader/patch', './ui/src/index']
  },
  output: {
    path: path.resolve(__dirname, './ui/assets'),
    filename: 'bundle.js',
    publicPath: 'assets/'
  },
  module: {
    rules: [
      { test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader' },
      { test: /\.json/, loader: 'json-loader' },
      ...cssLoaders,
      {
        test: /\.(ttf|eot|woff|svg)/,
        include: [path.resolve(__dirname, 'node_modules')],
        loader: 'file-loader'
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      React: 'react'
    })
  ],
  devServer: {
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://localhost:48763/',
        secure: false
      },
      '/wsapi': {
        target: 'ws://localhost:48763',
        ws: true
      }
    }
  }
};
