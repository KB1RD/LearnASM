const webpack = require('webpack');
const merge   = require('webpack-merge');
const resolve = require('path').resolve;
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const config = require('./webpack.base');
const root = resolve(__dirname, '..');

module.exports = merge(config, {
  devtool: '#inline-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: '"staging"' }
    }),
    new HtmlWebpackPlugin({
      template: resolve(root, 'src/index.html'),
      hash: true,
      inject: 'body'
    }),
    new CopyWebpackPlugin([
      {
        from: resolve(root, 'static')
      }
    ])
  ]
});
