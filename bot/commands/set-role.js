const rp = require('request-promise');
const covert = require('../../covert.js');
const updateGuildInfo = require('../events/update-guild-info.js');

module.exports = function(message, bot_auth, prefix, managerRole){

	let guild = message.channel.guild;
	let message_words = message.content.trim().split(/\s+/);

	if(message_words.length < 2){
		message.channel.send(`Invalid Syntax. Use \`${prefix}setrole [NEW ROLE NAME]\`.`);
		return;
	}

	if(message_words[1] === 'everyone') message_words[1] = '@everyone';

	return rp({
		method: 'PATCH',
		uri: `${covert.app_url}/api/guilds/${guild.id}/role`,
		body: {
			managerRole: message_words[1]
		},
		headers: {
			Authorization: bot_auth,
			'Author-Id': message.author.id
		},
		json: true
	})
	.then(res => {
		if(res.managerRole === '@everyone') message.channel.send(`Now everyone can modify stickers on this server!`)
		else message.channel.send(`\`${res.managerRole}\` is now the role required to modify stickers on this server.`)

		//When manager role is updated with setrole, call updateGuildInfo to re-check for managerIds
		updateGuildInfo(message.channel.guild);
	})
	.catch(err => {

		if(err.message.includes('Role must be less than 30 characters.')){
			message.channel.send(`Role must be less than 30 characters.`);
		}

		else if(err.message.includes('Unauthorized')){
			message.channel.send(`You must have the role \`${managerRole}\` to use this command.`);
		}

		else{
			message.channel.send('An unknown error occured.');
		}

	});

}