const rp = require('request-promise');

module.exports = function(user, bot_auth){

	rp({
		method: 'PATCH',
		uri: `${process.env.APP_URL}/api/users/${user.id}`,
		body: {
			username: user.username,
			avatar: user.avatar || null
		},
		headers: {Authorization: bot_auth},
		json: true
	});
	
}