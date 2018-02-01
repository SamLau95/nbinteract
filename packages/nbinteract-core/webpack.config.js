const path = require('path')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'index.bundle.js',
    path: path.resolve(__dirname, 'lib'),
    library: 'nbinteract-core',
    libraryTarget: 'umd',
  },
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
                'env',
                {
                  targets: { browsers: ['last 2 versions'] },
                },
              ],
            ],
            cacheDirectory: true,
            plugins: [
              'transform-runtime',
              'babel-plugin-transform-object-rest-spread',
            ],
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
