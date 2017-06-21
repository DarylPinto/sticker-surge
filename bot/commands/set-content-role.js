const rp = require('request-promise');
const covert = require('../../covert.js');
const updateGuildInfo = require('../events/update-guild-info.js');

module.exports = function(message, bot_auth, prefix, managerRole){

	let guild = message.channel.guild;
	let message_words = message.content.trim().split(/\s+/);

	if(message_words.length < 2){
		message.channel.send(`Invalid Syntax. Use \`${prefix}setContentRole [NEW ROLE NAME]\`.`);
		return;
	}

	let new_content_role = message_words[1];

	if(!guild.roles.array().map(r => r.name.toLowerCase()).includes(new_content_role.toLowerCase())){
		message.channel.send('That role does not exist.');
		return;
	}

	if(new_content_role === 'everyone') new_content_role = '@everyone';

	return rp({
		method: 'PATCH',
		uri: `${covert.app_url}/api/guilds/${guild.id}/content-role`,
		body: {
			contentRole: new_content_role
		},
		headers: {
			Authorization: bot_auth,
			'Author-Id': message.author.id
		},
		json: true
	})
	.then(res => {
		if(res.managerRole === '@everyone') message.channel.send(`Everyone can now create/delete stickers on this server.`)
		else message.channel.send(`\`${res.contentRole}\` is now the role required to create/delete stickers on this server.`)

		//When manager role is updated with setrole, call updateGuildInfo to re-check for contentIds
		updateGuildInfo(guild, bot_auth);
	})
	.catch(err => {

		console.log(err.message);

		if(err.message.includes('Role name must be less than 30 characters')){
			message.channel.send(`Role name must be less than 30 characters.`);
		}

		else if(err.message.includes('Unauthorized')){
			message.channel.send(`You must have the role \`${managerRole}\` to use this command.`);
		}

		else{
			message.channel.send('An unknown error occured.');
		}

	});

}