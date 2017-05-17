const rp = require('request-promise');
const express = require('express');
const simpleOauth = require('simple-oauth2');
const sessions = require('client-sessions');
const Cryptr = require('cryptr');
const User = require('../api/models/user-model.js');
const covert = require('../../covert.js');

const cryptr = new Cryptr(covert.refresh_token_key);

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

//Logout route (heh it rhymes)
logout: express.Router().get('/', (req, res) => {
	req.session.reset();
	res.redirect('/');
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
		const refresh_token = token.refresh_token;

		rp({
			method: 'GET',
			uri: 'https://discordapp.com/api/users/@me',
			headers: {
				'Authorization': `Bearer ${access_token}`
			}
		})
		.then(data => {	
			req.session.id = JSON.parse(data).id;	
			return User.findOne({id: JSON.parse(data).id});
		})
		.then(user => {
			if(user.refresh_token === '')	user.refresh_token = cryptr.encrypt(refresh_token);
			user.save();
		})
		.catch(err => {
			console.error(err);
		});

		req.session.tok = access_token;
		res.redirect('/your-stickers');
	})
	.catch(err => {
		console.error(err);
		res.redirect('/');
	});

})

/********/
}