const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpack = require('webpack');
const pkg = require("./package.json");

const extractPlugin = new ExtractTextPlugin({
    filename: 'main.css',
});

const definePlugin = new webpack.DefinePlugin({
    VERSION: JSON.stringify(pkg.version)
})

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/dist/'
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.scss$/,
                use: extractPlugin.extract({
                    use: ['css-loader', 'sass-loader']
                })
            },
            {
                test: /\.(jpe?g|gif|png|svg|woff|ttf|wav|mp3)$/,
                loader: 'file-loader',
                options: {
                    name: '[path][name].[ext]',
                    context: ''
                }
            }
        ]
    },
    plugins: [
        extractPlugin,
        definePlugin
    ],
    //mode: 'development'
};