const rp = require('request-promise');
const Cryptr = require('cryptr');
const User = require('../api/models/user-model.js');
const util = require('../api/utilities/utilities.js');
const covert = require('../../covert.js');

const cryptr = new Cryptr(covert.refresh_token_key);

function getNewAccessToken(id){return new Promise((resolve, reject) => {

	User.findOne({id: id})
	.then(user => {
		return cryptr.decrypt(user.refresh_token);
	})
	.then(refresh_token => {
		return rp({
			method: 'POST',
			uri: `https://discordapp.com/api/oauth2/token?grant_type=refresh_token&client_id=${covert.discord.app_id}&client_secret=${covert.discord.app_secret}&refresh_token=${refresh_token}`	
		})
	})	
	.then(data => {
		resolve(JSON.parse(data).access_token);
	})
	.catch(err => {
		reject(err);
	});

})};

function handleExpiredRefreshToken(){
	//User refresh_token is expired, 
	User.findOne({id: req.session.id}).then(user => {
		user.refresh_token = '';
		return user.save();
	})
	.then(() => {
		//redirect to login or return 401 if ajax request
		if(options.ajax) return res.status(401).send('Unauthorized');
		if(!options.ajax) return res.redirect('/login');
	})
	.catch(err => {
		console.log(err);
	});
}

module.exports = function(options = {ajax: false}){

return function(req, res, next){	

	//Verify discord bot
	let bot_auth = `Basic ${new Buffer(covert.bot_token_hash).toString('base64')}`;

	if(req.headers.authorization && req.headers.authorization === bot_auth){
		next();
		return;
	}

	if(!options.ajax && (!req.session.token || !req.session.id)) return res.redirect('/login');
	if(options.ajax && (!req.session.token || !req.session.id)) return res.status(401).send('Unauthorized');

	rp({
		method: 'GET',
		uri: 'https://discordapp.com/api/users/@me',
		headers: {'Authorization': `Bearer ${req.session.token}`}
	})
	.then(() => {
		next();
	})
	.catch(error => {

		//User access_token has expired, get a new token
		getNewAccessToken(req.session.id)
		.then(token => {
			req.session.token = token;
			next();
		})
		.catch(err => handleExpiredRefreshToken);

	});

}

}