const rp = require('request-promise');
const express = require('express');
const simpleOauth = require('simple-oauth2');
const sessions = require('client-sessions');
const setCookie = require('set-cookie');
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
	setCookie('id', '', {res});
	res.redirect('/');
}),

//Callback route (Redirect URI)
callback: express.Router().get('/', (req, res) => {

	let access_token;
	let refresh_token;
	let user_id;

	oauth2.authorizationCode.getToken({
		code: req.query.code,
		redirect_uri: 'http://localhost:3000/callback'	
	})
	.then(result => {

		const token = oauth2.accessToken.create(result).token;
		access_token = token.access_token;
		refresh_token = token.refresh_token;

		return rp({
			method: 'GET',
			uri: 'https://discordapp.com/api/users/@me',
			headers: {'Authorization': `Bearer ${access_token}`}
		});

	})
	.then(data => {
		user_id = JSON.parse(data).id;
		return User.findOne({id: user_id});
	})
	.then(user => {
		if(user.refresh_token === '')	user.refresh_token = cryptr.encrypt(refresh_token);
		return user.save();
	})
	.then(user => {
		req.session.token = access_token;
		//id is set twice, once as a tamper-proof httpOnly cookie for authentication,
		req.session.id = user_id;
		//the other is a regular un-encrypted cookie for the view to use
		setCookie('id', user_id, {res});
		res.redirect('/your-stickers');
	})
	.catch(err => {
		console.error(err);
		res.redirect('/');
	});

})

/********/
}