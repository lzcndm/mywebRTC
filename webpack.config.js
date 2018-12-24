const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js'
  },
  devServer: {
    contentBase: 'dist',
    host: 'localhost',
    port: 9527,
    disableHostCheck: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'webRTC',
      template: 'src/index-template.html'
    })
  ],
  devtool: 'inline-source-map'
}
