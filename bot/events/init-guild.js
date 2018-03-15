const rp = require('request-promise');
const covert = require('../../covert.js');
const updateGuildInfo = require('../events/update-guild-info.js');
const messageDefaultChannel = require('../utilities/message-default-channel.js');

module.exports = function(guild, bot_auth){
	
	const sendWelcomeMessage = prefix => {
		let escaped_prefix = prefix.replace(/[^a-zA-Z0-9]/g, '\\$&');
		messageDefaultChannel(guild, `This server can now use stickers! Type **${escaped_prefix}commands** to get started.`);	
	}

	rp({
		method: 'POST',
		uri: `${covert.app_url}/api/guilds/`,
		body: {
			id: guild.id,
			guildName: guild.name,
			icon: guild.icon || null
		},
		headers: {Authorization: bot_auth},
		json: true
	})
	.then(() => {
		console.log(`Guild ${guild.id} added!`);
		sendWelcomeMessage('$');
		updateGuildInfo(guild, bot_auth);
	})
	.catch(err => {

		if(err.statusCode != 409){
			console.error(err.message);
			return;
		}

		//Re-Activate guild, as it already exists within database
		rp({
			method: 'PATCH',
			uri: `${covert.app_url}/api/guilds/${guild.id}`,
			body: {isActive: true},
			headers: {Authorization: bot_auth},
			json: true
		})
		.then(res => {
			console.log(`Guild ${guild.id} activated!`);	
			sendWelcomeMessage(res.commandPrefix);
			updateGuildInfo(guild, bot_auth);
		})
		.catch(err => {
			console.error(err.message);
		});

	});
}