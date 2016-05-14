var gulp = require("gulp");
var eslint = require("gulp-eslint");
var babel = require("gulp-babel");
var mocha = require("gulp-spawn-mocha");
var sourcemaps = require("gulp-sourcemaps");

var webpack = require("gulp-webpack");

var codepaths_client = [
    "scripts/**/*.js",
    "!scripts/vendor/**",
    "shared/**/*.js"
];
var codepaths_server = [
    "src/**/*.js",
    "lib/**/*.js",
    "shared/**/*.js",
    "!src/dummy.js"
];
var testpaths = ["test/**/*.js"];
var allpaths = codepaths_client.slice().concat(codepaths_server).concat(testpaths.slice());

gulp.task("lint", function() {
    /*eslint-disable no-console*/
    if(process.stdout.rows) {  // Doesn't exist on Heroku
        console.log(Array(process.stdout.rows+1).join("\n"));
    }
    /*eslint-enable no-console*/
    return gulp.src(allpaths)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task("babel", ["lint"], function() {
    return gulp.src(allpaths.slice().concat(["!gulpfile.js"]), {base: "."})
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("out"));
});

gulp.task("mocha", ["babel"], function() {
    return gulp.src(testpaths, {read: false})
        //.pipe(mocha({reporter: "nyan"}));
        .pipe(mocha({reporter: "mocha-silent-reporter", compilers: "js:babel-register"}));
});

gulp.task("webpack", ["mocha"], function() {
    return gulp.src("out/scripts/*")
        .pipe(webpack(require("./out/scripts/webpack.config.js")))
        .pipe(gulp.dest("out/"));
});

gulp.task("build", ["lint", "babel", "mocha"], function() {
    console.log("done");
});

gulp.task("default", [], function() {
    gulp.watch(codepaths_client, ["build", "webpack"]);
    gulp.watch(codepaths_server, ["build"]);
    gulp.watch(testpaths, ["build"]);
});
