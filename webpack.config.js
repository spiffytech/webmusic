var webpack = require('webpack');  
module.exports = {  
  entry: './app.ts',
  output: {
    filename: 'build/bundle.js'
  },
  // Turn on sourcemaps
  devtool: 'source-map',
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.js', '.html']
  },
  // Add minification
  plugins: [
    //new webpack.optimize.UglifyJsPlugin()
  ],
  module: {
    loaders: [
      { test: /\.ts$/, loader: 'ts' }
    ]
  }
}

