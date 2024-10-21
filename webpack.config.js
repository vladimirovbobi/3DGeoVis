// webpack.config.js

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');

module.exports = {
  context: __dirname,
  entry: './src/app.js',
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    publicPath: '/',
  },
  resolve: {
    extensions: ['.js', '.json', '.css'],
    mainFields: ['module', 'main'],
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'], // Handles CSS imports
      },
      {
        test: /\.(png|gif|jpg|jpeg|svg|xml|json)$/,
        type: 'asset/resource', // Handles asset files
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html', // Template HTML file
      filename: 'index.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'node_modules/cesium/Build/Cesium/Workers', to: 'Workers' },
        { from: 'node_modules/cesium/Build/Cesium/Assets', to: 'Assets' },
        { from: 'node_modules/cesium/Build/Cesium/Widgets', to: 'Widgets' },
        { from: 'node_modules/cesium/Build/Cesium/ThirdParty', to: 'ThirdParty' },
        { from: 'src/data', to: 'data' }, // Copy your data files
      ],
    }),
    new Dotenv(), // Load environment variables from .env
    new webpack.DefinePlugin({
      CESIUM_BASE_URL: JSON.stringify(''), // Necessary for Cesium to locate assets
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'), // Serve static files from 'dist'
    },
    compress: true,
    port: 8080, // Change if needed
    hot: true,
    open: true,
  },
  performance: {
    hints: false,
  },
};
