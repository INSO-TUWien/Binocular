'use strict';

const path = require( 'path' );
const IconsPlugin = require( 'icons-loader/IconsPlugin' );

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
      },
      {
        test: /\.json/,
        loader: 'json-loader'
      },
      {
        test: /\.s[ac]ss$/,
        loaders: ['style-loader',
                  'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]__[hash:base64:5]',
                  'sass-loader']
      },
      {
        test: /\.css$/,
        loaders: [
          'style-loader',
          'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]__[hash:base64:5]'
        ]
      },
      {
        test: /\.svg$/,
        loader: 'icons-loader'
      }
    ]
  },
  plugins: [
    new IconsPlugin( {
      fontName: 'icons',
      timestamp: Math.round( Date.now() / 1000 ),
      normalize: true,
      formats: ['ttf', 'eot', 'woff', 'svg']
    } )
  ]
};
