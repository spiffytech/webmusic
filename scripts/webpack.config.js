var BowerWebpackPlugin = require("bower-webpack-plugin");
var webpack = require("webpack");

module.exports = {
    entry: {
        CmsBar: ["babel-polyfill", "./scripts/cmsbar.js"],
        Login: ["babel-polyfill", "./scripts/login.js"],
        PageEdit: ["babel-polyfill", "./scripts/pageedit.js"],
        PhotoOrganize: ["babel-polyfill", "./scripts/photoorganize.js"],
        FileUpload: ["babel-polyfill", "./scripts/fileupload.js"],
        SiteSettings: ["babel-polyfill", "./scripts/sitesettings.js"],

        Foundation: ["babel-polyfill", "./scripts/foundation.js"],
        vendor: [
            "!!script!vendor/jquery.min.js",
            "!!script!vendor/foundation.min.js"
        ]
    },
    externals: {
        jquery: "jQuery"
    },
    output: {
        path: __dirname,
        filename: "./scripts/[name].js"
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: [/node_modules/, /bower_components/], loader: "babel-loader"},
            { test: /\.css$/, loader: "style!css" },
            { test: /jschannel/, loader: "exports?Channel" }
            //{ test: /blissfuljs/, loader: "imports?self=window.self!exports?Bliss=window.self.Bliss!../node_modules/blissfuljs/bliss.shy.js" }
        ]
    },
    resolve: {
        modulesDirectories: ["./scripts", "./node_modules"],
        alias: {
            spin: "spin.js"
        }
    },
    devtool: "source-map",
    plugins: [
        new BowerWebpackPlugin(),
        new webpack.optimize.CommonsChunkPlugin({
            name: "webpack-common"
        })
    ]
};
