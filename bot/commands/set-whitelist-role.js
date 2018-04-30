const rp = require('request-promise');
const covert = require('../../covert.js');
const updateGuildInfo = require('../events/update-guild-info.js');

module.exports = function(message, bot_auth, prefix){

	let guild = message.channel.guild;
	let message_words = message.content.trim().split(/\s+/);

	//Remove first word from message_words if command was invoked with an @ mention
	if(/<@!?\d+>/.test(message_words[0]))	message_words.shift();

	//Escape prefix to avoid issues with Discord formatting
	let escaped_prefix = prefix.replace(/[^a-zA-Zа-яёА-ЯЁ0-9]/g, '\\$&');

	if(message_words.length < 2){
		message.channel.send(`Invalid Syntax. Use **${escaped_prefix}whitelist [ROLE NAME]**`);
		return;
	}

	let new_whitelist_role;
	let new_whitelist_role_name = message_words.slice(1).join(" ");
	if(new_whitelist_role_name === 'everyone') new_whitelist_role_name = '@everyone';	

	if(!guild.roles.array().map(r => r.name.toLowerCase()).includes(new_whitelist_role_name.toLowerCase())){
		message.channel.send('That role does not exist.');
		return;
	}
	else if(new_whitelist_role_name === '@everyone'){
		new_whitelist_role = '@everyone';
	}else{
		let role = guild.roles.array().find(r => r.name.toLowerCase() === new_whitelist_role_name.toLowerCase());
		new_whitelist_role = role.id;
		new_whitelist_role_name = role.name;
	}

	//Escape role name to avoid issues with Discord formatting
	let escaped_new_whitelist_role_name = new_whitelist_role_name.replace(/[^a-zA-Zа-яёА-ЯЁ0-9\s]/g, '\\$&');

	return rp({
		method: 'PATCH',
		uri: `${covert.app_url}/api/guilds/${guild.id}`,
		body: {
			whitelist: new_whitelist_role,
			list_mode: 'whitelist'
		},
		headers: {
			Authorization: bot_auth,
			'Author-Id': message.author.id
		},
		json: true
	})
	.then(res => {
		if(res.whitelist === '@everyone') message.channel.send(`Everyone can now send stickers on this server.`)
		else message.channel.send(`
			**${escaped_new_whitelist_role_name}** is now the role required to send stickers on this server.
			To restore default behavior, use **${prefix}whitelist everyone**
		`.replace(/\t/g, ''))

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