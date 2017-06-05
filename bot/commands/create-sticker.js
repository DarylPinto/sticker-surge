const rp = require('request-promise');
const covert = require('../../covert.js');

module.exports = function(message){

	let bot_auth = `Basic ${new Buffer(covert.bot_token_hash).toString('base64')}`;
	let messageWords = message.content.trim().split(/\s+/);
	let uri = `${covert.app_url}/api/guilds/${message.channel.guild.id}/stickers`;

	if(message.channel.type === 'dm'){
		uri = `${covert.app_url}/api/users/${message.author.id}/stickers`;	
	}

	if(messageWords.length < 3){
		message.channel.send('Invalid Syntax.')
	}

	let sticker_name = messageWords[1];
	let sticker_url = messageWords[2];

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