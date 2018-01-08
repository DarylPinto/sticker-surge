const rp = require('request-promise');
const covert = require('../../covert.js');

module.exports = function(user, bot_auth){

	rp({
		method: 'PATCH',
		uri: `${covert.app_url}/api/users/${user.id}`,
		body: {	
			id: user.id,	
			username: user.username,
			avatar: user.avatar || null
		},
		headers: {Authorization: bot_auth},
		json: true
	});
	
}