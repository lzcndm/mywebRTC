const merge = require('webpack-merge');
const common = require('./webpack.common');

module.exports = merge(common, {
    devtool: 'inline-source-map',
    devServer: {
        contentBase: 'dist',
        host: 'localhost',
        port: 9527,
        disableHostCheck: true
    },
    mode: 'development'
})