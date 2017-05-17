const rp = require('request-promise');
const express = require('express');
const simpleOauth = require('simple-oauth2');
const covert = require('../../covert.js');

const oauth2 = simpleOauth.create({
	client: {
		id: covert.discord.app_id,
		secret: covert.discord.app_secret 
	},
	auth: {
		tokenHost: 'https://discordapp.com',
		tokenPath: '/api/oauth2/token',
		authorizePath: '/api/oauth2/authorize',
		revokePath: '/api/oauth2/token/revoke'
	}
});

module.exports = {
/********/

//Login route
login: express.Router().get('/', (req, res) => {
	const authorizationUri = oauth2.authorizationCode.authorizeURL({
		redirect_uri: 'http://localhost:3000/callback',
		scope: 'identify'
		//scope: 'identify guilds'
	});

	res.redirect(authorizationUri);
}),


//Callback route (Redirect URI)
callback: express.Router().get('/', (req, res) => {

	oauth2.authorizationCode.getToken({
		code: req.query.code,
		redirect_uri: 'http://localhost:3000/callback'	
	})
	.then(result => {

		const token = oauth2.accessToken.create(result).token;
		const access_token = token.access_token;
		//const refresh_token = token.refresh_token;

		req.session.tok = access_token;
		//res.json({access_token, refresh_token});
		res.redirect('/your-stickers');
	})
	.catch(err => {
		console.error(err);
		res.redirect('/');
	});

})

/********/
}