const rp = require('request-promise');
const covert = require('../../covert.js');
const updateGuildInfo = require('../events/update-guild-info.js');

module.exports = function(guild, bot_auth){
	
	//Send welcome message to #general
	//If #general doesn't exist, iterate through channels by `calculatedPosition`
	//And send message to first channel that we have permission to
	const sendWelcomeMessage = prefix => {
		let escaped_prefix = prefix.replace(/[^a-zA-Z0-9]/g, '\\$&');
		let message_sent = false;

		let channels = guild.channels.array().filter(c => c.type === 'text');
		let general_channel = (channels.map(c => c.name).includes('general')) ? channels[channels.map(c => c.name).indexOf('general')] : null;

		let sorted_channels = channels.sort((a, b) => {
			if(a.calculatedPosition < b.calculatedPosition) return -1;
			else if(b.calculatedPosition < a.calculatedPosition) return 1;
			else return 0;
		});

		if(general_channel) sorted_channels.unshift(general_channel);

		let channel_index = 0;

		function attemptWelcome(){
			sorted_channels[channel_index].send(`
Your server can now use stickers!
Type **${escaped_prefix}help** to get started.

*Tip: Set the **Stickers for Discord** role color to \`#36393E\` and give this bot a short nickname for a seamless experience!*
			`)	
			.catch(err => {
				channel_index++;
				attemptWelcome();	
			});
		}

		attemptWelcome();
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