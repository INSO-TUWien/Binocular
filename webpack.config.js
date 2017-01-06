'use strict';

const path = require( 'path' );
const IconsPlugin = require( 'icons-loader/IconsPlugin' );

const cssModulesLoader = 'css-loader?modules&importLoaders=1&localIdentName=[name]__[local]__[hash:base64:5]';
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
    loaders: [
      'style-loader',
      'css-loader'
    ]
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
      path.resolve(__dirname, 'ui/global.scss')
    ],
    loaders: ['style-loader', cssModulesLoader, 'sass-loader']
  },
  {
    test: /global\.scss$/,
    include: path.resolve(__dirname, 'ui/global.scss'),
    loaders: ['style-loader', 'css-loader', 'sass-loader']
  }
];

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
      ...cssLoaders,
      {
        test: /\.(ttf|eot|woff|svg)/,
        include: [path.resolve( __dirname, 'node_modules' )],
        loader: 'file-loader'
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
      formats: ['ttf', 'eot', 'woff', 'svg']
    } )
  ]
};
