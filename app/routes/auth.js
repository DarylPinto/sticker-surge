const rp = require('request-promise');
const express = require('express');
const simpleOauth = require('simple-oauth2');
const sessions = require('client-sessions');
const Cryptr = require('cryptr');
const url = require('url');
const User = require('../api/models/user-model.js');

const cryptr = new Cryptr(process.env.REFRESH_TOKEN_KEY);

const oauth2 = simpleOauth.create({
	client: {
		id: process.env.DISCORD_APP_ID,
		secret: process.env.DISCORD_APP_SECRET 
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
		redirect_uri: `${process.env.APP_URL}/callback`,	
		scope: 'identify guilds',
		state: encodeURIComponent(req.header('Referer'))
	});

	res.redirect(authorizationUri);
}),

//Logout route (heh it rhymes)
logout: express.Router().get('/', (req, res) => {
	req.session.reset();
	res.clearCookie('id');
	res.clearCookie('guilds');
	res.redirect(req.header('Referer'));
}),

//Callback route (Redirect URI)
callback: express.Router().get('/', (req, res) => {
	let access_token;
	let refresh_token;
	let user_id;

	oauth2.authorizationCode.getToken({
		code: req.query.code,
		redirect_uri: `${process.env.APP_URL}/callback`	
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
		data = JSON.parse(data);
		user_id = data.id;
		return User.findOneAndUpdate(
			{id: user_id},
			{id: user_id,	username: data.username, avatar: data.avatar},
			{upsert: true,	new: true, setDefaultsOnInsert: true}
		);
	})
	.then(user => {
		if(user.refresh_token === '')	user.refresh_token = cryptr.encrypt(refresh_token);
		return user.save();
	})	
	.then(() => {

		const url_logged_in_from = decodeURIComponent(req.query.state);
		const path_logged_in_from = url.parse(url_logged_in_from).pathname;

		//Cookies are set twice, once as tamper-proof httpOnly cookies for authentication,
		req.session.token = access_token;
		req.session.id = user_id;
		
		//And again as standard cookies for the view to use
		res.cookie('id', user_id, {
			expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) //1 year
		});

		//Redirect to whichever page user was on when they clicked "Log in"
		//Unless it was the homepage, in that case redirect them to /servers
		(path_logged_in_from === '/')	? res.redirect('/servers') : res.redirect(url_logged_in_from);

	})
	.catch(err => {
		console.error(err);
		res.redirect('/');
	});

})

/********/
}