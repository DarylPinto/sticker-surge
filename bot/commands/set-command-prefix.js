const rp = require('request-promise');
const covert = require('../../covert.js');

module.exports = function(message, bot_auth, prefix){

	let guild = message.channel.guild;
	let message_words = message.content.trim().split(/\s+/);

	//Remove first word from message_words if command was invoked with an @ mention
	if(/<@\d+>/.test(message_words[0]))	message_words.shift();
	
	//Escape prefix to avoid issues with Discord formatting
	let escaped_prefix = prefix.replace(/[^a-zA-Z0-9]/g, '\\$&');

	if(message_words.length < 2){
		message.channel.send(`Invalid Syntax. Use **${escaped_prefix}setPrefix [NEW PREFIX]**.`);
		return;
	}

	let new_prefix = message_words[1];
	//Escape new prefix to avoid issues with Discord formatting
	let escaped_new_prefix = new_prefix.replace(/[^a-zA-Z0-9]/g, '\\$&');

	return rp({
		method: 'PATCH',
		uri: `${covert.app_url}/api/guilds/${guild.id}/command-prefix`,
		body: {
			commandPrefix: new_prefix
		},
		headers: {
			Authorization: bot_auth,
			'Author-Id': message.author.id
		},
		json: true
	})
	.then(res => {
		message.channel.send(`Stickers for Discord commands now begin with **${escaped_new_prefix}**\nType **${escaped_new_prefix}help** for a list of commands.`);
	})
	.catch(err => {
		
		if(err.message.includes('Prefix cannot be longer than 3 characters')){
			message.channel.send(`Prefix cannot be longer than 3 characters.`);
		}

		else if(err.message.includes('Illegal prefix')){
			message.channel.send(`Prefix cannot contain emoji or any of the following characters: **@ # -**`);
		}

		else if(err.message.includes('Unauthorized')){
			message.channel.send(`You must have permission to manage the server in order to use this command.`);
		}

		else{
			message.channel.send('An unknown error occured.');
		}

	});

}