const rp = require('request-promise');
const User = require('../api/models/user-model.js');

async function updateUserInfo(req, res, next){

	res.locals.updated = false;
	res.locals.username = null;
	res.locals.avatar = null;

	if(!req.session.token) return next();

	try{

		let user_request = await rp({
			method: 'GET',
			uri: 'https://discordapp.com/api/users/@me',
			headers: {'Authorization': `Bearer ${req.session.token}`},
			json: true
		});

		let user = await User.findOne({id: req.session.id});
		user.username = user_request.username;
		user.avatar = user_request.avatar;
		await user.save();

		res.locals.updated = true;
		res.locals.username = user_request.username;
		res.locals.avatar = user_request.avatar;
		return next();	

	}catch(err){
		console.error("Error updating user info");
		return next();
	}

}

module.exports = updateUserInfo;
