const rp = require('request-promise');
const covert = require('../../covert.js');

module.exports = function(guild, bot_auth){	
	
	rp({
		method: 'PATCH',
		uri: `${covert.app_url}/api/guilds/${guild.id}`,
		body: {isActive: false},
		headers: {Authorization: bot_auth},
		json: true
	})
	.then(res => {
		console.log(`Guild ${guild.id} deactivated!`);
	})
	.catch(err => {
		console.error(err.message);
	});
}