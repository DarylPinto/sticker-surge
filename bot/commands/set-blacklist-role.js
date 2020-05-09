const rp = require('request-promise');
const updateGuildInfo = require('../events/update-guild-info.js');

module.exports = function(message, bot_auth, prefix){

	let guild = message.channel.guild;
	let message_words = message.content.trim().split(/\s+/);

	//Remove first word from message_words if command was invoked with an @ mention
	if(/<@!?\d+>/.test(message_words[0]))	message_words.shift();

	//Escape prefix to avoid issues with Discord formatting
	let escaped_prefix = prefix.replace(/[^a-zA-Zа-яёА-ЯЁ0-9]/g, '\\$&');

	if(message_words.length < 2){
		return message.channel.send(`Invalid Syntax. Use **${escaped_prefix}blacklist [ROLE NAME]**`);	
	}

	let new_blacklist_role;
	let new_blacklist_role_name = message_words.slice(1).join(" ");
	if(new_blacklist_role_name === 'everyone' || new_blacklist_role_name === '@everyone'){
		return message.channel.send('You cannot blacklist everyone.');	
	}
	else if(!guild.roles.array().map(r => r.name.toLowerCase()).includes(new_blacklist_role_name.toLowerCase())){	
		return message.channel.send('That role does not exist.');
	}
	else{
		let role = guild.roles.array().find(r => r.name.toLowerCase() === new_blacklist_role_name.toLowerCase());
		new_blacklist_role = role.id;
		new_blacklist_role_name = role.name;
	}

	//Escape role name to avoid issues with Discord formatting
	let escaped_new_blacklist_role_name = new_blacklist_role_name.replace(/[^a-zA-Zа-яёА-ЯЁ0-9\s]/g, '\\$&');

	return rp({
		method: 'PATCH',
		uri: `${process.env.APP_URL}/api/guilds/${guild.id}/sticker-user-role`,
		body: {
			listMode: 'blacklist',
			blacklistRole: new_blacklist_role,
			whitelistRole: null	
		},
		headers: {
			Authorization: bot_auth,
			'Author-Id': message.author.id
		},
		json: true
	})
	.then(res => {	
		message.channel.send(`
			All users __without__ the role **${escaped_new_blacklist_role_name}** are now able to send stickers on this server.
			To restore default behavior, use **${prefix}whitelist everyone**
		`.replace(/\t/g, ''));

		//When blacklist role is updated with setrole, call updateGuildInfo to update ids
		updateGuildInfo(guild, bot_auth);
	})
	.catch(err => {

		if(err.message.includes('Unauthorized')){
			message.channel.send(`You must have permission to manage the server in order to use this command.`);
		}

		else{
			console.log(err.message);
			message.channel.send('An unknown error occured.');
		}

	});

}