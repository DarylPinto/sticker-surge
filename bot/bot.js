const Discord = require('discord.js');
const rp = require('request-promise');
const client = new Discord.Client();
const covert = require('../covert.js');
const bot_auth = `Basic ${new Buffer(covert.bot_token_hash).toString('base64')}`;

//Useful stack trace for unhandledRejection errors
process.on('unhandledRejection', r => console.error(r));

//////////////////
//Event Handlers//
//////////////////
const sendSticker = require('./events/send-sticker.js');
const initGuild = require('./events/init-guild.js');
const deactivateGuild = require('./events/deactivate-guild.js');
const updateGuildInfo = require('./events/update-guild-info.js');
const initUser = require('./events/init-user.js');
const updateUserInfo = require('./events/update-user-info.js');
const updateDblStats = require('./events/update-dbl-stats.js');

client.on('ready', () => {
	client.user.setPresence({game: {name: 'stickersfordiscord.com'}});
	client.guilds.forEach(g => updateGuildInfo(g, bot_auth));
	updateDblStats(client);
	console.log('Stickers for Discord bot is online!');
});

//Add guild to db for the first time, update Discord Bot List guild count
client.on('guildCreate', guild => {
	initGuild(guild, bot_auth);
	updateDblStats(client);
});

//Set isActive flag to false in db when bot leaves guild, update Discord Bot List guild count
client.on('guildDelete', guild => {
	//SetTimeout prevents race condition between guildDelete and guildUpdate
	setTimeout(() => {
		deactivateGuild(guild, bot_auth);
		updateDblStats(client);
	}, 1500);
});

//Update guild info (specifically guild name/icon) when a guild is updated
client.on('guildUpdate', (oldGuild, newGuild) => {
	updateGuildInfo(newGuild, bot_auth);
});

//Update guild info (specifically managerIds) when a guildMember is updated
client.on('guildMemberUpdate', (oldMember, newMember) => {
	if(newMember.user.id != client.user.id) updateGuildInfo(newMember.guild, bot_auth);
});

//Update guild info (specifically managerIds) when a role is updated
client.on('roleUpdate', (oldRole, newRole) => {
	updateGuildInfo(newRole.guild, bot_auth);
});

//Update guild info (specifically sticker manager role) when a role is deleted
client.on('roleDelete', role => {
	updateGuildInfo(role.guild, bot_auth);
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
	'whitelist': require('./commands/set-whitelist-role.js'),
	'blacklist': require('./commands/set-blacklist-role.js'),
	'setprefix': require('./commands/set-command-prefix.js'),
	'setmanagerrole': require('./commands/set-sticker-manager-role.js'),
	'commands': require('./commands/commands.js'),
	'help': require('./commands/help.js')
}

//Sticker detection regex
const sticker_regex = () => /^((:|;)[a-zA-Zа-яёА-ЯЁ0-9-]+(:|;)|-[a-zA-Zа-яёА-ЯЁ0-9-]+)$/g;

//Allow user to post sticker by editing a message incase of a typo
client.on('messageUpdate', (oldMessage, newMessage) => {
	if(newMessage.author.bot) return false;
	if(sticker_regex().test(newMessage.content.trim())) sendSticker(newMessage, bot_auth);
});

//Listen for posting stickers or using commands
client.on('message', message => {

	//Ignore messages from bots
	if(message.author.bot) return false;

	////////////////
	//Send sticker//
	////////////////
	if(sticker_regex().test(message.content.trim())){
		sendSticker(message, bot_auth);
		return false;
	}

	////////////
	//Commands//
	////////////
	let message_content = message.content.toLowerCase().trim();
	let message_words = message_content.split(/\s+/);
	let first_word = message_words[0];
	let second_word = message_words.length > 1 ? message_words[1] : null;
	let message_has_command = Object.keys(commands).some(command => {
		return first_word.endsWith(command) || first_word === `<@${client.user.id}>` || first_word === `<@!${client.user.id}>`;
	});

	//Guild messages
	if(message.channel.type === 'text'){

		if(!message_has_command) return false; //Ensures the API isn't called on every message

		rp({uri: `${covert.app_url}/api/guilds/${message.channel.guild.id}`, json: true})
		.then(guild => {

			let prefix = guild.commandPrefix.toLowerCase();	

			const usedGuildCommand = command => {
				if(first_word === `${prefix}${command}`) return true;
				else if((first_word === `<@${client.user.id}>` || first_word === `<@!${client.user.id}>`) && second_word === command){
					return true;
				}
				else return false;
			}

			if(usedGuildCommand('stickers')) commands.stickers(message)
			else if(usedGuildCommand('createsticker')) commands.createsticker(message, bot_auth, prefix, guild)
			else if(usedGuildCommand('deletesticker')) commands.deletesticker(message, bot_auth, prefix, guild)
			else if(usedGuildCommand('whitelist')) commands.whitelist(message, bot_auth, prefix)
			else if(usedGuildCommand('blacklist')) commands.blacklist(message, bot_auth, prefix)
			else if(usedGuildCommand('setprefix')) commands.setprefix(message, bot_auth, prefix)
			else if(usedGuildCommand('setmanagerrole')) commands.setmanagerrole(message, bot_auth, prefix)
			else if(usedGuildCommand('commands')) commands.commands(message, prefix, guild)
			else if(usedGuildCommand('help')) commands.help(message, prefix, guild)

		});

	}

	//Private messages
	else if(message.channel.type === 'dm'){

		rp({uri: `${covert.app_url}/api/users/${message.author.id}`, json: true})
		.then(user => {

			let custom_stickers = user.customStickers;

			const usedDmCommand = command => {
				if(first_word.endsWith(command)) return true;
				else if((first_word === `<@${client.user.id}>` || first_word === `<@!${client.user.id}>`) && second_word === command){
					return true;
				}
				else return false;
			}

			if(usedDmCommand('stickers')) commands.stickers(message)
			else if(usedDmCommand('createsticker')) commands.createsticker(message, bot_auth)
			else if(usedDmCommand('deletesticker')) commands.deletesticker(message, bot_auth)
			else if(usedDmCommand('commands')) commands.commands(message)
			else if(usedDmCommand('help')) commands.help(message, null, custom_stickers)
			else{
				message.channel.send('Unrecognized command. Here is a list of commands:');
				commands.commands(message);	
			}

			updateUserInfo(message.author, bot_auth); //note: this is async

		})
		.catch(err => {

			//If user doesn't exist, initialize user and welcome them
			if(!err.message.includes('User not found')) return false;

			initUser(message.author, bot_auth); //note: this is async
			message.channel.send('Hello! Here is a list of commands:');
			commands.commands(message);

		});

	}

});

client.login(covert.discord.bot_token);
