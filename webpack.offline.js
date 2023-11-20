import { merge } from 'webpack-merge';
// import TerserPlugin from 'terser-webpack-plugin'; // suspicious to use too much memory on reset
import HtmlWebpackPlugin from 'html-webpack-plugin';
import * as commonConfig from './webpack.common.js';
import path from 'path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const opts = {
  ENV: 'offline', // for loading in-browser db stuff, see ui/src/database/localDB.js
};

export default merge(commonConfig, {
  mode: 'production', // for webpack internal optimization
  entry: [require.resolve('babel-polyfill'), './ui/src/index'],
  devtool: false,
  output: {
    path: path.resolve(__dirname, './dist/'),
    filename: 'assets/js/[name].[contenthash:8].js',
    chunkFilename: 'assets/js/[name].[contenthash:8].chunk.js',
    assetModuleFilename: 'assets/media/[name].[hash][ext]',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [{ loader: 'ifdef-loader', options: opts }],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './ui/index.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 30000,
      maxSize: 0,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
    minimize: true,
    // minimizer: [
    //   new TerserPlugin({
    //     terserOptions: {
    //       parse: {
    //         ecma: 2018,
    //       },
    //       compress: {
    //         ecma: 5,
    //         comparisons: false,
    //         inline: 2,
    //       },
    //       mangle: {
    //         safari10: true,
    //       },
    //       keep_classnames: false,
    //       keep_fnames: false,
    //     },
    //   }),
    // ],
    runtimeChunk: {
      name: (entrypoint) => `runtime~${entrypoint.name}`,
    },
    removeAvailableModules: true,
    removeEmptyChunks: true,
    mergeDuplicateChunks: true,
  },
  performance: {
    hints: 'warning',
  },
  // output: {
  //   path: path.join(__dirname, '/dist'),
  //   pathinfo: true,
  //   filename: 'assets/bundle.js',
  // },
});
