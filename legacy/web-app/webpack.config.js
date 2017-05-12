const ExtractTextPlugin = require("extract-text-webpack-plugin");
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = {

	//define entry point
	entry: "./app/index.js",

	//define output point
	output: {
		path: 'public',
		filename: 'bundle.js'
	},

	//Allow vue standalone build
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

			//json
			{
				test: /\.json$/,
				exclude: /(node_modules)/,
				loader: 'json'
			},

			//sass
			{
				test: /\.(sass|scss)$/,
				loader: ExtractTextPlugin.extract('style', 'css!sass')
				//loaders: ['style', 'css?sourceMap', 'sass?sourceMap']
			},

			//images
			{
				test: /.*\.(gif|png|jpe?g|svg)$/i,
				loaders: [
					'file?hash=sha512&digest=hex&name=[name].[ext]',
					'image-webpack?{optimizationLevel: 7, interlaced: false, pngquant:{quality: "80-90", speed: 4}, mozjpeg: {quality: 85}}'
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
		new ExtractTextPlugin("style.css"),
		new OptimizeCssAssetsPlugin()
	]

};