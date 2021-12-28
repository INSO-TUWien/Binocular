'use strict';

const webpack = require('webpack');
const path = require('path');

const cssModulesLoader = {
  loader: 'css-loader',
  options: {
    importLoaders: 1,
    modules: {
      localIdentName: '[name]__[local]__[hash:base64:5]',
    },
  },
};

const cssLoaders = [
  // loaders for loading external css
  {
    test: /\.s[ac]ss$/,
    include: path.resolve(__dirname, 'node_modules'),
    exclude: path.resolve(__dirname, 'ui'),
    use: [{ loader: 'style-loader' }, { loader: 'css-loader' }, { loader: 'sass-loader' }],
  },
  {
    test: /\.css$/,
    include: path.resolve(__dirname, 'node_modules'),
    exclude: path.resolve(__dirname, 'ui'),
    use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
  },

  // loaders for custom css
  {
    test: /\.css$/,
    exclude: path.resolve(__dirname, 'node_modules'),
    use: [{ loader: 'style-loader' }, cssModulesLoader],
  },
  {
    test: /\.s[ac]ss$/,
    exclude: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, 'ui/src/global.scss'),
    ],
    use: [{ loader: 'style-loader' }, cssModulesLoader, { loader: 'sass-loader' }],
  },
  {
    test: /global\.scss$/,
    include: path.resolve(__dirname, 'ui/src/global.scss'),
    use: [{ loader: 'style-loader' }, { loader: 'css-loader' }, { loader: 'sass-loader' }],
  },
];

module.exports = {
  entry: ['./ui/src/index'],
  output: {
    path: path.resolve(__dirname, './ui/assets'),
    pathinfo: true,
    filename: 'bundle.js',
    publicPath: 'assets/',
  },
  module: {
    rules: [
      { test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel-loader' },
      ...cssLoaders,
      {
        test: /\.(ttf|eot|woff|svg)/,
        include: [path.resolve(__dirname, 'node_modules')],
        loader: 'file-loader',
      }
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      React: 'react',
      process: 'process/browser',
    }),
    new webpack.LoaderOptionsPlugin({ debug: true }),
  ],
  resolve: {
    alias: {
      http: 'stream-http',
      https: 'https-browserify',
      stream: 'stream-browserify',
      zlib: 'browserify-zlib',
    },
    fallback: {
      "url": require.resolve("url/"),
      "util": require.resolve("util/"),
      "assert": require.resolve("assert/"),
      "crypto": require.resolve("crypto-browserify")
    },
  },
};
