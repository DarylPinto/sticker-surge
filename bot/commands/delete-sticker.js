const rp = require('request-promise');
const covert = require('../../covert.js');

module.exports = function(message, bot_auth, prefix, sticker_manager_role){

	let message_words = message.content.trim().split(/\s+/);
	if(message.channel.type === 'dm') prefix = '';
	//Escape prefix to avoid issues with Discord formatting
	let escaped_prefix = prefix.replace(/[^a-zA-Z0-9]/g, '\\$&');

	if(message_words.length < 2){
		message.channel.send(`Invalid Syntax. Use **${escaped_prefix}deleteSticker [STICKER NAME]**.`);
		return;
	}

	let sticker_name = message_words[1].toLowerCase().replace(/(:|-)/g, '');
	let uri = `${covert.app_url}/api/users/${message.author.id}/stickers/${sticker_name}`;

	if(message.channel.type === 'text'){
		uri = `${covert.app_url}/api/guilds/${message.channel.guild.id}/stickers/${sticker_name}`;
	}
	
	return rp({
		method: 'DELETE',
		uri: uri,	
		headers: {
			Authorization: bot_auth,
			'Author-Id': message.author.id
		},
		json: true
	})
	.then(res => {
		let sticker_display_name = (message.channel.type === 'dm') ? `-${sticker_name}` : `:${sticker_name}:`;
		message.channel.send(`\`${sticker_display_name}\` sticker deleted!`);
	})
	.catch(err => {
		if(err.message.includes('does not have a custom sticker with that name')){
			message.channel.send('There\'s no sticker with that name.');
		}

		else if(err.message.includes('Unauthorized')){
			message.channel.send(`You cannot delete stickers you didn't create.\nIf you want to manage your own custom stickers, private message this bot.`);
		}

		else{
			message.channel.send('An unknown error occured.');
		}
	});

}