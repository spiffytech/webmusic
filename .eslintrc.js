module.exports = {
    "parser": "babel-eslint",
    parserOptions: {
        ecmaVersion: 6
    },
    globals: {
        "requirejs": true,
        "define": true
    },
    "rules": {
        "no-console": 0,
        "no-debugger": 1,
        "indent": [
            2,
            4
        ],
        "quotes": [
            2,
            "double"
        ],
        "linebreak-style": [
            2,
            "unix"
        ],
        "semi": [
            2,
            "always"
        ],
        "no-unused-vars": [2, {"args": "after-used", "argsIgnorePattern": "^_"}],
        "no-unreachable": [1]
    },
    "env": {
        "es6": true,
        "browser": true,
        "node": true,
        "mocha": true
    },
    "extends": "eslint:recommended"
};
