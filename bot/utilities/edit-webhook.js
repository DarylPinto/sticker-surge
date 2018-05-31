//This file provides a way to edit a webhook's channel ID.
//This feature is available in future versions of Discord.js but not in the one
//currently used by this bot
const rp = require('request-promise');

module.exports = async function(client, options){
	const { bot_token, hook_id, body } = options;	

	//Convert body.avatar (URL) into Discord's `Avatar Data`
	//https://discordapp.com/developers/docs/resources/user#avatar-data
	const avatar_buf = await rp({method: 'GET', uri: body.avatar, encoding: null});
	body.avatar = `data:image/png;base64,${avatar_buf.toString('base64')}`;

	const hook_res = await rp({
		method: 'PATCH',
		uri: `https://discordapp.com/api/webhooks/${hook_id}`,
		headers: {'Authorization': `Bot ${bot_token}`},
		body: body,
		json: true
	});
		
	return client.fetchWebhook(hook_id);
}