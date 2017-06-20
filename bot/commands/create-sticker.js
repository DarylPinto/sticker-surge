const rp = require('request-promise');
const covert = require('../../covert.js');

module.exports = function(message, bot_auth, prefix, managerRole){

	let message_words = message.content.trim().split(/\s+/);	
	let attachments = message.attachments.array();
	let uri = `${covert.app_url}/api/users/${message.author.id}/stickers`;

	if(message.channel.type === 'text'){
		uri = `${covert.app_url}/api/guilds/${message.channel.guild.id}/stickers`;	
	}

	if(
		(attachments.length === 0 && message_words.length < 3) ||
		(attachments.length > 0 && message_words.length < 2)
	){
		message.channel.send(`Invalid Syntax. Use \`${prefix}createsticker [NAME] [IMAGE URL]\` or \`${prefix}createsticker [NAME]\` with an image attached.`);
		return;
	}

	let sticker_name = message_words[1].toLowerCase().replace(/(:|-)/g, '');
	let sticker_url = message_words[2];
	
	if(attachments.length > 0 && (attachments[0].width)){
		sticker_url = attachments[0].url;
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
		message.channel.send(`\`:${sticker_name}:\` sticker created!`);
	})
	.catch(err => {
		if(err.message.includes('Guild already has a custom sticker with that name')){
			message.channel.send('There\'s already a sticker with that name.');
		}

		else if(err.message.includes('Unauthorized')){
			message.channel.send(`You must have the role \`${managerRole}\` to create stickers for everyone on this server.\nIf you want to add your own custom stickers, private message me.`);
		}

		else if(err.message.includes('Sticker name already in use by an emoji')){
			message.channel.send(`Sticker name already in use by an emoji: :${sticker_name}:`);
		}

		else if(err.message.includes('Sticker name must contain lowercase letters and numbers only')){
			message.channel.send('Sticker name must contain lowercase letters and numbers only.');
		}

		else{
			message.channel.send('An unknown error occured.');
		}
	});

}