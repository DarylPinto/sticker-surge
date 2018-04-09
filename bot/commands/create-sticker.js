const rp = require('request-promise');
const covert = require('../../covert.js');

module.exports = function(message, bot_auth, prefix, sticker_manager_role){

	let message_words = message.content.trim().split(/\s+/);	
	let attachments = message.attachments.array();
	let invalid_syntax_message;
	let uri;

	//Remove first word from message_words if command was invoked with an @ mention
	if(/<@!?\d+>/.test(message_words[0]))	message_words.shift();

	//change request uri and prefix if message is a private message
	if(message.channel.type === 'dm'){
		uri = `${covert.app_url}/api/users/${message.author.id}/stickers`;
		prefix = '';
	}else if(message.channel.type === 'text'){
		uri = `${covert.app_url}/api/guilds/${message.channel.guild.id}/stickers`;
	}

	//Escape prefix to avoid issues with Discord formatting
	let escaped_prefix = prefix.replace(/[^a-zA-Zа-яёА-ЯЁ0-9]/g, '\\$&');

	//Prepare invalid syntax message (with or without syntax depending on if it's a private message or not)
	invalid_syntax_message = `Invalid Syntax. Use **${escaped_prefix}createSticker [STICKER NAME] [IMAGE URL]** or **${escaped_prefix}createSticker [STICKER NAME]** with an image attached.`;

	//Regular syntax checking
	if(
		(attachments.length === 0 && message_words.length < 3) ||
		(attachments.length > 0 && message_words.length < 2)
	){
		message.channel.send(invalid_syntax_message);
		return;
	}

	let sticker_name = message_words[1].toLowerCase().replace(/(:|-)/g, '');
	let sticker_url = message_words[2];	

	//Determine if attachment is an image, if so use the attachment URL for the sticker
	if(attachments.length > 0 && (attachments[0].width)){
		sticker_url = attachments[0].url;
	}

	//Client side check if sticker_url resembles an actual url
	if(!sticker_url.startsWith('http')){
		message.channel.send(invalid_syntax_message);	
		return;
	}

	return rp({
		method: 'POST',
		uri: uri,
		body: {	
			name: sticker_name,	
			url: sticker_url 
		},
		headers: {
			Authorization: bot_auth,
			'Author-Id': message.author.id
		},
		json: true
	})
	.then(res => {
		let sticker_display_name = (message.channel.type === 'dm') ? `-${sticker_name}` : `:${sticker_name}:`;
		message.channel.send(`\`${sticker_display_name}\` sticker created!`);
	})
	.catch(err => {
		if(err.message.includes('already has a custom sticker with that name')){
			message.channel.send('There\'s already a sticker with that name.');
		}

		else if(err.message.includes('Unauthorized')){
			let role = message.channel.guild.roles.find(r => r.id === sticker_manager_role);
			sticker_manager_role_name = role.name.replace(/[^a-zA-Zа-яёА-ЯЁ0-9\s]/g, '\\$&');

			message.channel.send(`You must have the role **${sticker_manager_role_name}** to create stickers for everyone on this server.\nIf you want to create your own stickers (which will still be usable here), private message this bot.`);
		}

		else if(err.message.includes('Sticker name already in use by an emoji')){
			message.channel.send(`Sticker name already in use by an emoji: :${sticker_name}:`);
		}

		else if(err.message.includes('Sticker name must contain lowercase letters and numbers only')){
			message.channel.send('Sticker name must contain lowercase letters and numbers only.');
		}

		else if(err.message.includes('Sticker name cannot be longer than 20 characters')){
			message.channel.send('Sticker name cannot be longer than 20 characters.');
		}

		else if(err.message.includes('User has reached maximum amount of custom stickers')){
			message.channel.send('You already have too many custom stickers.');
		}

		else if(err.message.includes('Guild has reached maximum amount of custom stickers')){
			message.channel.send('This server already has too many custom stickers.');
		}

		else{
			message.channel.send('An unknown error occured.');
		}
	});

}