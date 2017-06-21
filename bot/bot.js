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
	'setprefix': require('./commands/set-prefix.js'),
	'setcontentrole': require('./commands/set-content-role.js'),
	'setmanagerrole': require('./commands/set-manager-role.js'),
	'help': require('./commands/help.js')
}

//Listen for posting stickers or using commands
client.on('message', message => {

	////////////////
	//Send sticker//
	////////////////
	if( /^:[a-zA-Z0-9-]+:$/.test(message.content.trim()) ){
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
			let managerRole = guild.managerRole;
			let contentRole = guild.contentRole;

			if(first_word === `${prefix}stickers`) commands.stickers(message)
			else if(first_word === `${prefix}createsticker`) commands.createsticker(message, bot_auth, prefix, contentRole)
			else if(first_word === `${prefix}deletesticker`) commands.deletesticker(message, bot_auth, prefix, contentRole)
			else if(first_word === `${prefix}setprefix`) commands.setprefix(message, bot_auth, prefix, managerRole)
			else if(first_word === `${prefix}setcontentrole`) commands.setcontentrole(message, bot_auth, prefix, managerRole)
			else if(first_word === `${prefix}setmanagerrole`) commands.setmanagerrole(message, bot_auth, prefix, managerRole)
			else if(first_word === `${prefix}help`) commands.help(message, prefix, contentRole, managerRole)

		});

	}

	//Private messages
	else if(message.channel.type == 'dm'){

		//Stop immediately if message was sent by this bot and not user
		if(message.author.id == client.user.id) return false;

		rp({uri: `${covert.app_url}/api/users/${message.author.id}`, json: true})
		.then(user => {

			if(!message_has_command){
				message.channel.send('Unrecognized command.');
				commands.help(message);
			}

			if(first_word.endsWith('stickers')) commands.stickers(message)
			else if(first_word.endsWith('createsticker')) commands.createsticker(message, bot_auth)
			else if(first_word.endsWith('deletesticker')) commands.deletesticker(message, bot_auth)
			else if(first_word.endsWith('help')) commands.help(message)

		});

	}

});

client.login(covert.discord.bot_token);