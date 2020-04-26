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
    entry: {
        'bundle.js': [
            path.resolve(__dirname, 'src/index.js'),
            path.resolve(__dirname, 'src/enrich-order/OrderView.js'),
            path.resolve(__dirname, 'src/enrich-order/EnrichOrderTranslate.js'),
            path.resolve(__dirname, 'src/enrich-order/EnrichOrderUtils.js'),
            path.resolve(__dirname, 'src/enrich-order/services/User.js'),
            path.resolve(__dirname, 'src/enrich-order/services/TimeLine.js'),
            path.resolve(__dirname, 'src/enrich-order/services/Table.js'),
            path.resolve(__dirname, 'src/enrich-order/services/Segmentations.js'),
            path.resolve(__dirname, 'src/enrich-order/services/Promotions.js'),
            path.resolve(__dirname, 'src/enrich-order/services/Payments.js'),
            path.resolve(__dirname, 'src/enrich-order/services/Oth.js'),
            path.resolve(__dirname, 'src/enrich-order/services/Items.js'),
            path.resolve(__dirname, 'src/enrich-order/services/Histories.js'),
            path.resolve(__dirname, 'src/enrich-order/services/Dishes.js'),
            path.resolve(__dirname, 'src/enrich-order/services/Discounts.js'),
            path.resolve(__dirname, 'src/enrich-order/services/Courses.js'),
        ]
    },
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
