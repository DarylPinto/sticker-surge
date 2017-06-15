const path = require('path');
const webpack = require('webpack');
//const ExtractTextPlugin = require("extract-text-webpack-plugin");
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const imageWebpackLoaderOptions = {
	query: {	
		mozjpeg: {
			quality: 85,
			optimizationLevel: 7,
			interlaced: true
		},
		pngquant: {
			quality: '80-90',
			speed: 4,
			optimizationLevel: 7,
			interlaced: true
		}
	}	
}

module.exports = {

	//define entry point(s)
	entry: "./src/index.js",

	//define output point(s)
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'public')
	},

	//Aliases
	resolve: {
	  alias: {
	    'vue$': 'vue/dist/vue'
	  }
	},

	//loaders
	module: {
		loaders: [

			//javascript
			{
				test: /\.js$/,
				exclude: /(node_modules)/,
				loader: 'babel-loader?sourceMap'
			},

			//sass
			{
				test: /\.(sass|scss)$/,
				use: [
					{loader: 'style-loader'},
					{loader: 'css-loader'},
					{loader: 'sass-loader'}
				]
				//loader: ExtractTextPlugin.extract({fallback: 'style-loader', use: 'css-loader!sass-loader'})
			},

			//images
			{
				test: /.*\.(gif|png|jpe?g|svg)$/i,
				exclude: /(node_modules)/,
				use: [
					{
						loader: 'file-loader?name=[name].[ext]&outputPath=images/'
					},
					{
						loader: 'image-webpack-loader',
						options: imageWebpackLoaderOptions
					}
				]
			},

			//.vue component files
			{
				test: /\.vue$/,
				exclude: /(node_modules)/,
				loader: 'vue-loader'
			}

		]
	},

	//plugins
	plugins: [
		//new ExtractTextPlugin("bundle.css"),
		new OptimizeCssAssetsPlugin(),
		new webpack.ProvidePlugin({Promise: 'es6-promise-promise'})
	]

};