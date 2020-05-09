const rp = require('request-promise');
const Cryptr = require('cryptr');
const User = require('../api/models/user-model.js');

const cryptr = new Cryptr(process.env.REFRESH_TOKEN_KEY);

/**
* Requests a new user access token from Discord's API
*
* @param {String} id - Discord user ID
* @returns {Promise} - New access token
*/
function getNewAccessToken(id){return new Promise((resolve, reject) => {

	User.findOne({id: id})
	.then(user => {
		return cryptr.decrypt(user.refresh_token);
	})
	.then(refresh_token => {
		return rp({
			method: 'POST',
			uri: `https://discordapp.com/api/oauth2/token?grant_type=refresh_token&client_id=${process.env.DISCORD_APP_ID}&client_secret=${process.env.DISCORD_APP_SECRET}&refresh_token=${refresh_token}`	
		})
	})	
	.then(data => {
		resolve(JSON.parse(data).access_token);
	})
	.catch(err => {
		reject(err);
	});

})};

/**
* Delete stored refresh token from database
* If request is ajax, respond with 401, otherwise redirect to /login
*/
function handleExpiredRefreshToken(req, res, next, options){

	User.findOne({id: req.session.id}).then(user => {
		user.refresh_token = '';
		return user.save();
	})
	.then(() => {
		if(options.ajax) return res.status(401).send('Unauthorized');
		return res.redirect('/login');
	})
	.catch(err => {
		console.log(err);
	});
}

/**
* Verify that request is coming from the correct user, or from official Sticker Surge bot
*
* options {Object}
* - ajax {Boolean} - True request is ajax
*/
module.exports = function(options = {ajax: false}){

return function(req, res, next){
	
	let bot_auth = `Basic ${Buffer.from(process.env.DISCORD_BOT_TOKEN_HASH).toString('base64')}`;

	if(req.headers.authorization && req.headers.authorization === bot_auth){
		res.locals.userId = req.headers['author-id']; //also add res.locals for user guilds
		next();
		return;
	}

	if(options.ajax && (!req.session.token || !req.session.id)) return res.status(401).send('Unauthorized');
	if(!options.ajax && (!req.session.token || !req.session.id)) return res.redirect('/login');

	rp({
		method: 'GET',
		uri: 'https://discordapp.com/api/users/@me',
		headers: {'Authorization': `Bearer ${req.session.token}`}
	})
	.then(() => {
		res.locals.userId = req.session.id;
		next();
	})
	.catch(error => {

		//User access_token has expired, get a new token
		getNewAccessToken(req.session.id)
		.then(token => {
			res.locals.userId = req.session.id;
			req.session.token = token;
			next();
		})
		.catch(err => {
			handleExpiredRefreshToken(req, res, next, options);
		});

	});

}

}