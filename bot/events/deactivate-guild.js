const rp = require('request-promise');

module.exports = function(guild, bot_auth){	
	
	rp({
		method: 'PATCH',
		uri: `${process.env.APP_URL}/api/guilds/${guild.id}`,
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