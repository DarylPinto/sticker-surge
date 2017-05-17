const rp = require('request-promise');
const router = require('express').Router();
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
		console.log(data);
		resolve(data);
	})
	.catch(err => {
		reject(err);
	});

})};

router.get('/', (req, res) => {

	console.log(req.session);

	getNewAccessToken(req.session.id);

	if(!req.session.tok) return res.redirect('/login');	

	rp({
		method: 'GET',
		uri: 'https://discordapp.com/api/users/@me',
		headers: {
			'Authorization': `Bearer ${req.session.tok}`
		}
	})
	.then(data => {
		data = JSON.parse(data);
		res.redirect(`/user/${data.id}`);
	})
	.catch(err => {
		console.log(err.message);
		if(err.message.includes('401: Unauthorized')){	
			getNewAccessToken(req.session.id);
		}
	});

});

module.exports = router;