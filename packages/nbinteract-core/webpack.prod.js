const webpack = require('webpack');
const merge = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin

const common = require('./webpack.common.js');

module.exports = merge(common, {
  devtool: 'source-map',
  plugins: [
    new UglifyJSPlugin({
      parallel: true,
      cache: true,
      sourceMap: true,
      extractComments: true,
      uglifyOptions: {
        // bqplot uses ES6 so this makes sure Uglify can handle that
        ecma: 6,
      }
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      // openAnalyzer: true,
    }),
  ],
});
