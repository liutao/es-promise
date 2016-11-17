var webpack = require('webpack')

module.exports = {
  entry: './src/promise.js',
  output: {
    path: './dist/',
    filename: 'es-promise.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        // excluding some local linked packages.
        // for normal use cases only node_modules is needed.
        exclude: /node_modules/,
        loader: 'babel'
      },
    ]
  },
  babel: {
    presets: ['es2015'],
    plugins: ['transform-runtime']
  }
}

