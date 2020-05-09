//This file provides a way to edit a webhook's channel ID.
//This feature is available in future versions of Discord.js but not in the one
//currently used by this bot
const rp = require('request-promise');

module.exports = async function(hook_id, channel_id){

	await rp({
		method: 'PATCH',
		uri: `https://discordapp.com/api/webhooks/${hook_id}`,
		headers: {'Authorization': `Bot ${process.env.DISCORD_APP_BOT_TOKEN}`},
		body: {channel_id},
		json: true
	});
		
	return true;
}