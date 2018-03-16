const rp = require('request-promise');
const covert = require('../../covert.js');
const updateGuildInfo = require('../events/update-guild-info.js');

module.exports = function(message, bot_auth, prefix){

	let guild = message.channel.guild;
	let message_words = message.content.trim().split(/\s+/);

	//Remove first word from message_words if command was invoked with an @ mention
	if(/<@\d+>/.test(message_words[0]))	message_words.shift();

	//Escape prefix to avoid issues with Discord formatting
	let escaped_prefix = prefix.replace(/[^a-zA-Z0-9]/g, '\\$&');

	if(message_words.length < 2){
		message.channel.send(`Invalid Syntax. Use **${escaped_prefix}setRole [NEW ROLE NAME]**`);
		return;
	}

	let new_sticker_manager_role = message_words[1];
	if(new_sticker_manager_role === 'everyone') new_sticker_manager_role = '@everyone';
	//Escape prefix to avoid issues with Discord formatting
	let escaped_new_sticker_manager_role = new_sticker_manager_role.replace(/[^a-zA-Z0-9]/g, '\\$&');

	if(!guild.roles.array().map(r => r.name.toLowerCase()).includes(new_sticker_manager_role.toLowerCase())){
		message.channel.send('That role does not exist.');
		return;
	}


	return rp({
		method: 'PATCH',
		uri: `${covert.app_url}/api/guilds/${guild.id}/sticker-manager-role`,
		body: {
			stickerManagerRole: new_sticker_manager_role
		},
		headers: {
			Authorization: bot_auth,
			'Author-Id': message.author.id
		},
		json: true
	})
	.then(res => {
		if(res.stickerManagerRole === '@everyone') message.channel.send(`Everyone can now create stickers on this server.`)
		else message.channel.send(`**${escaped_new_sticker_manager_role}** is now the role required to create stickers on this server.`)

		//When sticker manager role is updated with setrole, call updateGuildInfo to update ids
		updateGuildInfo(guild, bot_auth);
	})
	.catch(err => {

		if(err.message.includes('Role name must be less than 30 characters')){
			message.channel.send(`Role name must be less than 30 characters.`);
		}

		else if(err.message.includes('Unauthorized')){
			message.channel.send(`You must have permission to manage the server in order to use this command.`);
		}

		else{
			console.log(err.message);
			message.channel.send('An unknown error occured.');
		}

	});

}