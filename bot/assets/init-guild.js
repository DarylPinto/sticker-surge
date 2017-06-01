const rp = require('request-promise');

module.exports = function(guild){
	rp({
		method: 'POST',
		uri: 'http://localhost:3000/api/guilds/',
		body: {
			id: guild.id,
			guildName: guild.name,	
			icon: guild.icon || null
		},
		json: true
	})
	.then(res => {
		console.log(res);
	})
	.catch(err => {
		console.error(err.message);
	});
}