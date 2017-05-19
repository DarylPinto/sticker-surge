const rp = require('request-promise');
const Cryptr = require('cryptr');
const User = require('../api/models/user-model.js');
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

module.exports = function(options = {api: false}){

return function(req, res, next){

	if(!options.api && (!req.session.token || !req.session.id))	return res.redirect('/login');
	if(options.api && (!req.session.token || !req.session.id)) return res.status(401).send('Unauthorized');

	rp({
		method: 'GET',
		uri: 'https://discordapp.com/api/users/@me',
		headers: {
			'Authorization': `Bearer ${req.session.token}`
		}
	})
	.then(data => {
		next();
	})
	.catch(error => {

		//User access_token has expired, get a new token
		getNewAccessToken(req.session.id)
		.then(token => {
			req.session.token = token;	
			next();
		})
		.catch(err => {
			//User refresh_token is expired, 
			//redirect to login or return 401 if ajax request	
			User.findOne({id: req.session.id}).then(user => {
				user.refresh_token = '';
				return user.save();
			})
			.then(() => {
				console.log(options);
				if(options.api) return res.status(401).send('Unauthorized');
				if(!options.api) return res.redirect('/login');
			})
			.catch(err => {
				console.log(err);
			});
			
		});

	});

}

}