var webpack = require("webpack");  
var path = require("path")
var ManifestPlugin = require("webpack-manifest-plugin");
var ChunkManifestPlugin = require("chunk-manifest-webpack-plugin");
var HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {  
  entry: './client/app.ts',
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
    new webpack.DefinePlugin({
      "process.env": {
          NODE_ENV: JSON.stringify(process.env.NODE_ENV)
      }
    }),
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
    new HtmlWebpackPlugin({title: "WebMusic", template: "client/index.ejs"}),
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
       test: /\.(eot|svg|ttf|woff|woff2)$/,
       loader: 'file?name=public/fonts/[name].[ext]'
      },
      { test: /\.json$/, loader: "json-loader" },  // for ajv (JSON-Schema validator)
    ]
  },
  devServer: {
    historyApiFallback: {
      index: "index.html"
    },
    host: "0.0.0.0",
    compress: true
  }
}

