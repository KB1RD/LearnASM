const webpack = require('webpack');
const merge   = require('webpack-merge');
const resolve = require('path').resolve;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

const config = require('./webpack.base');
const root = resolve(__dirname, '..');

module.exports = merge(config, {
  devtool: '#cheap-module-eval-source-map',
  devServer: {
    hot: true,
    inline: true,
    port: 3000,
    open: true,
    contentBase: resolve(root, 'dist'),
    publicPath: '/',
  },
  plugins: [
    new ProgressBarPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: '"develop"' }
    }),
    new HtmlWebpackPlugin({
      template: resolve(root, 'src/index.html'),
      inject: true
    }),
  ]
});
