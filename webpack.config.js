const path = require('path');

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
  }
}
