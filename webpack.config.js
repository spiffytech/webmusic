var webpack = require("webpack");  
var path = require("path")
var ExtractTextPlugin = require("extract-text-webpack-plugin")
var ManifestPlugin = require("webpack-manifest-plugin");
var ChunkManifestPlugin = require("chunk-manifest-webpack-plugin");
var HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {  
  entry: './app.ts',
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].[chunkhash].js',
    chunkFilename: '[name].[chunkhash].js'
  },
  // Turn on sourcemaps
  devtool: 'source-map',
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js', '.html']
  },
  // Add minification
  plugins: [
    //new webpack.optimize.UglifyJsPlugin()
    new ExtractTextPlugin("bundle.css"),
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      minChunks: Infinity,
    }),
    new ManifestPlugin(),
    new ChunkManifestPlugin({
      filename: "chunk-manifest.json",
      manifestVariable: "webpackManifest"
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new HtmlWebpackPlugin({title: "WebMusic", template: "index.ejs"}),
    new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery'
    })
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
      },
        {
            test: /(foundation\.core)/,
            loader: 'exports?foundation=jQuery.fn.foundation'
        },
    ]
  },
  sassLoader: {
    includePaths: [path.resolve(__dirname, "node_modules")]
  },
  devServer: {
    historyApiFallback: {
      index: "index.html"
    },
    host: "0.0.0.0",
    compress: true
  }
}

