const rp = require('request-promise');
const covert = require('../../covert.js');

module.exports = function(guild, bot_auth){

	let guild_manager_ids = guild.members.filter(m => m.hasPermission('MANAGE_GUILD')).map(m => m.id);
	let sticker_manager_ids;

	rp({uri: `${covert.app_url}/api/guilds/${guild.id}`, json: true})
	.then(res => {

		if(res.stickerManagerRole === '@everyone'){
			sticker_manager_ids = [];
			return;
		}

		sticker_manager_ids = guild.roles
			.find(r => r.name.toLowerCase() === res.stickerManagerRole.toLowerCase()).members
			.map(m => m.id);

	})
	.then(() => {

		return rp({
			method: 'PATCH',
			uri: `${covert.app_url}/api/guilds/${guild.id}`,
			body: {
				guildManagerIds: guild_manager_ids,
				stickerManagerIds: sticker_manager_ids,
				icon: guild.icon || null
			},
			headers: {Authorization: bot_auth},
			json: true
		});

	})
	.catch(err => {
		console.error(err.message);
	});
	
}