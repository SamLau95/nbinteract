const merge = require('webpack-merge')
const path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin

const coreConfig = require('../nbinteract-core/webpack.config.js')

const config = merge(coreConfig, {
  entry: {
    index: './src/index.js',
    test: './src/test.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'built'),
    publicPath: 'built/',
  },
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      analyzerPort: 9999,
      generateStatsFile: true,
      openAnalyzer: false,
    }),
  ],
})

module.exports = config
