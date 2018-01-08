const rp = require('request-promise');
const covert = require('../../covert.js');

module.exports = function(user, bot_auth){

	rp({
		method: 'POST',
		uri: `${covert.app_url}/api/users`,
		body: {	
			id: user.id,	
			username: user.username,
			avatar: user.avatar
		},
		headers: {Authorization: bot_auth},
		json: true
	});

}