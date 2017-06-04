const rp = require('request-promise');
const covert = require('../../covert.js');

module.exports = function(guild){
	rp({
		method: 'PATCH',
		uri: `${covert.app_url}/api/guilds/${guild.id}`,
		body: {isActive: false},
		json: true
	})
	.then(res => {
		console.log(`Guild ${guild.id} deactivated!`);
	})
	.catch(err => {
		console.error(err.message);
	});
}