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
	.then(() => {
		console.log(`Guild ${guild.id} added!`);
	})
	.catch(err => {
		
		rp({
			method: 'PATCH',
			uri: `http://localhost:3000/api/guilds/${guild.id}`,
			body: {isActive: true},
			json: true
		})
		.then(res => {
			console.log(`Guild ${guild.id} activated!`);
		})
		.catch(err => {
			console.error(err.message);
		});

	});
}