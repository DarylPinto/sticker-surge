const rp = require('request-promise');

module.exports = function(message, bot_auth, prefix){

	let message_words = message.content.trim().split(/\s+/);

	//Remove first word from message_words if command was invoked with an @ mention
	if(/<@!?\d+>/.test(message_words[0]))	message_words.shift();

	if(message.channel.type === 'dm') prefix = '';
	//Escape prefix to avoid issues with Discord formatting
	let escaped_prefix = prefix.replace(/[^a-zA-Zа-яёА-ЯЁ0-9]/g, '\\$&');

	if(message_words.length < 2){
		message.channel.send(`Invalid Syntax. Use **${escaped_prefix}removepack [PACK PREFIX]**`);
		return;
	}

	let pack_key = message_words[1].toLowerCase();

	let uri = `${process.env.APP_URL}/api/users/${message.author.id}/sticker-packs`;

	if(message.channel.type === 'text'){
		uri = `${process.env.APP_URL}/api/guilds/${message.channel.guild.id}/sticker-packs`;
	}
	
	return rp({
		method: 'DELETE',
		uri: uri,
		body: {	
			packKey: pack_key
		},
		headers: {
			Authorization: bot_auth,
			'Author-Id': message.author.id
		},
		json: true
	})
	.then(res => {
		let response_start = (message.channel.type === 'text') ? 'This server is' : 'You are';
		message.channel.send(`${response_start} no longer using the **${res.packName}** Sticker Pack!`);
	})
	.catch(err => {
		if(err.message.includes('Sticker Pack not found')){
			message.channel.send(`There's no sticker pack with that prefix.\nYou can view all available sticker packs here: <${process.env.APP_URL}/sticker-packs>`);
		}

		else if(err.message.includes('Unauthorized')){
			message.channel.send(`You do not have permission to remove sticker packs.`);
		}

		else if(err.message.includes('does not have a Sticker Pack')){
			let response_start = (message.channel.type === 'text') ? 'This server is' : 'You are';
			message.channel.send(response_start + ' not using that sticker pack.');
		}

		else{
			console.log(err);
			message.channel.send('An unknown error occured.');
		}
	});

}
