const rp = require('request-promise');

module.exports = function(guild){
	rp({
		method: 'PATCH',
		uri: `http://localhost:3000/api/guilds/${guild.id}`,
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