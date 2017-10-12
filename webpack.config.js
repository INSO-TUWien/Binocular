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
  devtool: 'cheap-module-source-map',
  entry: [
    require.resolve('babel-polyfill'),
    require.resolve('react-dev-utils/webpackHotDevClient'),
    require.resolve('react-error-overlay'),
    './ui/src/index'
  ],
  output: {
    path: path.resolve(__dirname, './ui/assets'),
    pathinfo: true,
    filename: 'bundle.js',
    publicPath: 'assets/',
    devtoolModuleFilenameTemplate: info =>
      path.resolve(info.absoluteResourcePath).replace(/\\/g, '/')
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
    }),
    new webpack.LoaderOptionsPlugin({ debug: true }),
    new webpack.NamedModulesPlugin()
  ],
  devServer: {
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://localhost:48763/',
        secure: false
      },
      '/graphQl': {
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
