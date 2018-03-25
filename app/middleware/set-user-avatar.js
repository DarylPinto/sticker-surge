const rp = require('request-promise');
const User = require('../api/models/user-model.js');

async function setUserAvatar(req, res, next){

	res.locals.avatar = null;
	res.locals.updated = false;

	if(!req.session.token) return next();

	try{

		let user_request = await rp({
			method: 'GET',
			uri: 'https://discordapp.com/api/users/@me',
			headers: {'Authorization': `Bearer ${req.session.token}`},
			json: true
		});

		let user = await User.findOne({id: req.session.id});
		user.avatar = user_request.avatar;
		await user.save();

		res.locals.avatar = user_request.avatar;
		res.locals.updated = true;
		return next();	

	}catch(err){
		console.error("Error updating user avatar");
		return next();
	}

}

module.exports = setUserAvatar;
