var webpack = require('webpack')

module.exports = {
  entry: {
    'promise': './src/promise'
  },
  output: {
    path: './dist/',
    filename: '[name].js'
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

