//This file provides a way to edit a webhook's channel ID.
//This feature is available in future versions of Discord.js but not in the one
//currently used by this bot
const rp = require('request-promise');
const covert = require('../../covert.js');

module.exports = async function(hook_id, channel_id){

	const hook_res = await rp({
		method: 'PATCH',
		uri: `https://discordapp.com/api/webhooks/${hook_id}`,
		headers: {'Authorization': `Bot ${covert.discord.bot_token}`},
		body: {channel_id},
		json: true
	});
		
	return true;
}