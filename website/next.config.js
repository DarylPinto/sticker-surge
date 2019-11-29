const path = require("path");
const withSass = require("@zeit/next-sass");

module.exports = withSass({
	// eslint-disable-next-line no-unused-vars
	webpack(config, options) {
		config.resolve.modules.push(__dirname, "src");

		config.module.rules.push({
			test: /\.md$/,
			use: "raw-loader"
		});

		return config;
	},
	cssModules: true
});
