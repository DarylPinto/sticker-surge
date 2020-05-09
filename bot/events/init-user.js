const rp = require('request-promise');

module.exports = function(user, bot_auth){

	rp({
		method: 'POST',
		uri: `${process.env.APP_URL}/api/users`,
		body: {	
			id: user.id,	
			username: user.username,
			avatar: user.avatar || null
		},
		headers: {Authorization: bot_auth},
		json: true
	});

}