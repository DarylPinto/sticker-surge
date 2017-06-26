const Discord = require('discord.js');
const rp = require('request-promise');
const client = new Discord.Client();
const covert = require('../covert.js');
let bot_auth = `Basic ${new Buffer(covert.bot_token_hash).toString('base64')}`;

//////////////////
//Event Handlers//
//////////////////
const sendSticker = require('./events/send-sticker.js');
const initGuild = require('./events/init-guild.js');
const deactivateGuild = require('./events/deactivate-guild.js');
const updateGuildInfo = require('./events/update-guild-info.js');

client.on('ready', () => {
	client.user.setGame('stickersfordiscord.com');
	client.guilds.forEach(g => updateGuildInfo(g, bot_auth));
	console.log('Stickers for Discord bot is online!');
});

//Add guild to db for the first time
client.on('guildCreate', guild => initGuild(guild, bot_auth));

//Set isActive flag to false in db when bot leaves guild
client.on('guildDelete', guild => deactivateGuild(guild, bot_auth));

//Update guild info (specifically managerIds) when a guildMember is updated
client.on('guildMemberUpdate', (oldMember, newMember) => {
	if(newMember.user.id != client.user.id) updateGuildInfo(newMember.guild, bot_auth);
});

//Update guild info (specifically managerIds) when a role is updated
client.on('roleUpdate', (oldRole, newRole) => {
	updateGuildInfo(newRole.guild, bot_auth);
});

//Allow user to post sticker by editing a message incase of a typo
client.on('messageUpdate', (oldMessage, newMessage) => {
	if(/^:[a-zA-Z0-9-]+:$/.test(newMessage.content.trim())) sendSticker(newMessage);
});

////////////////
//Bot commands//
////////////////
const commands = {
	'stickers': require('./commands/stickers.js'),
	'createsticker': require('./commands/create-sticker.js'),
	'deletesticker': require('./commands/delete-sticker.js'),
	//'addstickerpack': require('./commands/add-stickerpack.js'),
	//'removestickerpack': require('./commands/remove-stickerpack.js'),
	'setprefix': require('./commands/set-command-prefix.js'),
	'setrole': require('./commands/set-sticker-manager-role.js'),
	'help': require('./commands/help.js')
}

//Listen for posting stickers or using commands
client.on('message', message => {

	////////////////
	//Send sticker//
	////////////////
	if( /^(:|-)[a-zA-Z0-9-]+:?$/.test(message.content.trim()) ){
		sendSticker(message);
		return false;
	}

	////////////
	//Commands//
	////////////
	let message_words = message.content.toLowerCase().trim().split(/\s+/);
	let first_word = message_words[0];
	let message_has_command = Object.keys(commands).some(command => {
		return first_word.endsWith(command);
	});

	//Guild messages
	if(message.channel.type == 'text'){

		if(!message_has_command) return false; //Ensures the API isn't called on every message

		rp({uri: `${covert.app_url}/api/guilds/${message.channel.guild.id}`, json: true})
		.then(guild => {

			let prefix = guild.commandPrefix;
			let guild_manager_ids = guild.guildManagerIds;
			let sticker_manager_role = guild.stickerManagerRole;

			if(first_word === `${prefix}stickers`) commands.stickers(message)
			else if(first_word === `${prefix}createsticker`) commands.createsticker(message, bot_auth, prefix, sticker_manager_role)
			else if(first_word === `${prefix}deletesticker`) commands.deletesticker(message, bot_auth, prefix, sticker_manager_role)
			else if(first_word === `${prefix}setprefix`) commands.setprefix(message, bot_auth, prefix)
			else if(first_word === `${prefix}setrole`) commands.setrole(message, bot_auth, prefix)
			//else if(first_word === `${prefix}setmanagerrole`) commands.setmanagerrole(message, bot_auth, prefix, managerRole)
			//else if(first_word === `${prefix}info`) commands.info(message, prefix, contentRole, managerRole, guild)
			else if(first_word === `${prefix}help`) commands.help(message, prefix, sticker_manager_role, guild_manager_ids)

		});

	}

	//Private messages
	else if(message.channel.type == 'dm'){

		//Stop immediately if message was sent by this bot and not user
		if(message.author.id == client.user.id) return false;

		rp({uri: `${covert.app_url}/api/users/${message.author.id}`, json: true})
		.then(user => {	

			if(first_word.endsWith('stickers')) commands.stickers(message)
			else if(first_word.endsWith('createsticker')) commands.createsticker(message, bot_auth)
			else if(first_word.endsWith('deletesticker')) commands.deletesticker(message, bot_auth)
			else if(first_word.endsWith('help')) commands.help(message)
			else{
				message.channel.send('Unrecognized command. Here are a list of commands:');
				commands.help(message);	
			}

		})
		.catch(err => {

			//If user doesn't exist, initialize user and welcome them
			if(!err.message.includes('User not found')) return false;

			rp({
				method: 'POST',
				uri: `${covert.app_url}/api/users`,
				body: {	
					id: message.author.id,	
					username: message.author.username,
					avatar: message.author.avatar
				},
				headers: {Authorization: bot_auth},
				json: true
			})
			.then(() => {
				message.channel.send('Hello! Here are a list of commands:');
				commands.help(message);
			});

		});

	}

});

client.login(covert.discord.bot_token);