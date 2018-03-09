const webpack = require('webpack')
const path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin

const escape = s => {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
}

// These modules will get a stubbed version when required. Used to cut down
// bundle size since tree-shaking doesn't work with Typescript modules.
const shimmed_modules = [
  'moment',
  'comment-json',
  '@jupyterlab/apputils',
  '@jupyterlab/codemirror',
]
const shims = shimmed_modules.map(
  mod =>
    new webpack.NormalModuleReplacementPlugin(
      new RegExp(escape(mod)),
      resource => {
        resource.request = path.resolve(__dirname, `src/shims/${mod}`)
      },
    ),
)

const config = {
  mode: 'development',
  entry: {
    index: './src/index.js',
  },
  output: {
    filename: 'index.bundle.js',
    path: path.resolve(__dirname, 'lib'),
  },
  devtool: 'cheap-module-eval-source-map',
  plugins: [...shims],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: { browsers: ['last 2 Chrome versions'] },
                  useBuiltIns: 'entry',
                  modules: false,
                },
              ],
            ],
            plugins: ['@babel/plugin-syntax-dynamic-import'],
            cacheDirectory: true,
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
}

module.exports = config
