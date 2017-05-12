const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

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
				loader: ExtractTextPlugin.extract({fallback: 'style-loader', use: 'css-loader!sass-loader'})
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
		new ExtractTextPlugin("bundle.css"),
		new OptimizeCssAssetsPlugin()
	]

};