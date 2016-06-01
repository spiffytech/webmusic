var webpack = require('webpack');  
var path = require('path')
var ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {  
  entry: './app.ts',
  output: {
    filename: 'build/bundle.js'
  },
  // Turn on sourcemaps
  devtool: 'source-map',
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js', '.html']
  },
  // Add minification
  plugins: [
    //new webpack.optimize.UglifyJsPlugin()
    new ExtractTextPlugin("bundle.css")
  ],
  module: {
    loaders: [
      { test: /\.tsx?$/, loader: 'ts' },
      { test: /\.css$/, loader: "style-loader!css-loader" },
      {
        // for some modules like foundation
        test: /\.scss$/,
        exclude: [/node_modules/], // sassLoader will include node_modules explicitly
        loader: ExtractTextPlugin.extract("style", "css!postcss!sass?outputStyle=expanded")
      }
    ]
  },
  sassLoader: {
    includePaths: [path.resolve(__dirname, "node_modules")]
  }
}

