const rp = require('request-promise');
const covert = require('../../covert.js');
const updateGuildInfo = require('../events/update-guild-info.js');

module.exports = function(guild, bot_auth){

	let joinMessage = prefix => `
Your server can now use stickers!
Type \`${prefix}help\` to get started.

*Tip: Set the **Stickers for Discord** role color to \`#36393E\` and give me a short nickname for a seamless experience!*
	`;

	//Get role with highest position (Thanks gymno)
	let highest_role = guild.roles.find(r => r.calculatedPosition === message.guild.roles.size - 1).name;

	rp({
		method: 'POST',
		uri: `${covert.app_url}/api/guilds/`,
		body: {
			id: guild.id,
			guildName: guild.name,
			managerRole: highest_role,
			icon: guild.icon || null
		},
		headers: {Authorization: bot_auth},
		json: true
	})
	.then(() => {
		console.log(`Guild ${guild.id} added!`);
		guild.defaultChannel.send(joinMessage('$'));
		updateGuildInfo(guild, bot_auth);
	})
	.catch(err => {
		
		rp({
			method: 'PATCH',
			uri: `${covert.app_url}/api/guilds/${guild.id}`,
			body: {isActive: true},
			headers: {Authorization: bot_auth},
			json: true
		})
		.then(res => {
			console.log(`Guild ${guild.id} activated!`);	
			guild.defaultChannel.send(joinMessage(res.commandPrefix));
		})
		.catch(err => {
			console.error(err.message);
		});

	});
}