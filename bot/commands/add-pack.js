const rp = require('request-promise');

module.exports = function(message, bot_auth, prefix){

	let message_words = message.content.trim().split(/\s+/);

	//Remove first word from message_words if command was invoked with an @ mention
	if(/<@!?\d+>/.test(message_words[0]))	message_words.shift();

	if(message.channel.type === 'dm') prefix = '';
	//Escape prefix to avoid issues with Discord formatting
	let escaped_prefix = prefix.replace(/[^a-zA-Zа-яёА-ЯЁ0-9]/g, '\\$&');

	if(message_words.length < 2){
		message.channel.send(`Invalid Syntax. Use **${escaped_prefix}addpack [PACK PREFIX]**\nYou can view all available sticker packs here: <${process.env.APP_URL}/sticker-packs>`);
		return;
	}

	let pack_key = message_words[1].toLowerCase();

	let uri = `${process.env.APP_URL}/api/users/${message.author.id}/sticker-packs`;

	if(message.channel.type === 'text'){
		uri = `${process.env.APP_URL}/api/guilds/${message.channel.guild.id}/sticker-packs`;
	}
	
	return rp({
		method: 'POST',
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
		let view_link = (message.channel.type === 'text') ?
			`${process.env.APP_URL}/server/${message.channel.guild.id}#${pack_key}` :
			`${process.env.APP_URL}/user/${message.author.id}#${pack_key}`;
		message.channel.send(`Successfully added the **${res.packName}** Sticker Pack!\nClick here to view the stickers in this pack: <${view_link}>`);
	})
	.catch(err => {
		if(err.message.includes('Sticker Pack not found')){
			message.channel.send(`There's no sticker pack with that prefix. Make sure you're using the sticker pack *prefix*, not the sticker pack *name*.\nYou can view all available sticker packs here: <${process.env.APP_URL}/sticker-packs>\nClick the "Use This Pack" button on the website for help.`);
		}

		else if(err.message.includes('Unauthorized')){
			message.channel.send(`You do not have permission to add sticker packs.`);
		}

		else if(err.message.includes('Sticker Pack is unlisted. Cannot be subscribed to.')){
			message.channel.send('That sticker pack is no longer available.');
		}

		else if(err.message.includes('Pack has not been published')){
			message.channel.send(`That sticker pack has not been published yet.`);
		}

		else if(err.message.includes('already has that Sticker Pack')){
			let response_start = (message.channel.type === 'text') ? 'This server is' : 'You are';
			message.channel.send(response_start + ' already using that sticker pack.');
		}

		else{
			console.log(err);
			message.channel.send('An unknown error occured.');
		}
	});

}
