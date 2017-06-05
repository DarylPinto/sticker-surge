const rp = require('request-promise');
const covert = require('../../covert.js');

module.exports = function(message, bot_auth){

	let message_words = message.content.trim().split(/\s+/);
	let uri = `${covert.app_url}/api/guilds/${message.channel.guild.id}/stickers`;

	if(message.channel.type === 'dm'){
		uri = `${covert.app_url}/api/users/${message.author.id}/stickers`;	
	}

	if(messageWords.length < 2){
		message.channel.send('Invalid Syntax.')
	}

	let sticker_name = message_words[1];
	let sticker_url = message_words[2];

	return rp({
		method: 'POST',
		uri: uri,
		body: {	
			name: sticker_name,	
			url: sticker_url 
		},
		headers: {Authorization: bot_auth},
		json: true
	})
	.then(res => {
		message.channel.send(`\`:${sticker_name}:\` created!`);
	})
	.catch(err => {
		message.channel.send(err.message);
	});

}