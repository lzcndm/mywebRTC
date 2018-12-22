const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'main.js'
  },
  devServer: {
    contentBase: 'public',
    host: 'localhost',
    port: 9527,
    disableHostCheck: true
  }
}
