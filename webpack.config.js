/**
 * Created by William Schaller on 12/15/2015.
 */
var path = require('path');

module.exports = {
    output: {
        libraryTarget: "commonjs2",
        library: "orb"
    },
    entry: "./src/js/orb.js",
    module: {
        loaders: [
            {
                test: /\.js/,
                loader: 'babel-loader'
            },
            {
                test: /\.js/,
                loader: 'eslint-loader', exclude: /node_modules/
            },
            {
                test: path.join(__dirname, 'src', 'js', 'orb.js'),
                loader: 'expose?orb'
            }
        ]
    },
    resolve: {
        root: [
            path.join(__dirname, 'src', 'js'),
            path.join(__dirname, "node_modules")
        ],
        modulesDirectories: [
            'node_modules',
            'src/js'
        ],
        extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx']
    },
    eslint: {
        configFile: path.join(__dirname, '.eslintrc'),
        emitError: true
    }
};