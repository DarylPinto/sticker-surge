const Discord = require('discord.js');
const client = new Discord.Client();
const covert = require('../covert.js');

//Assets
const sendSticker = require('./assets/send-sticker.js');
const initGuild = require('./assets/init-guild.js');
const deactivateGuild = require('./assets/deactivate-guild.js');
const updateGuildInfo = require('./assets/update-guild-info.js');

client.on('ready', () => console.log('Discord Stickers bot is online!'));

//Add guild to db for the first time
client.on('guildCreate', guild => initGuild(guild));

//Set isActive flag to false in db when bot leaves guild
client.on('guildDelete', guild => deactivateGuild(guild));

//Listen for posting stickers or using commands
client.on('message', message => {

	////////////
	//Stickers//
	////////////
	if( /^:[a-zA-Z0-9-]+:$/.test(message.content.trim()) ){
		sendSticker(message);
		return false;
	}

	//TODO: When manager role is updated with !setrole, call updateGuildInfo to re-check for managerIds

});

//Allow user to post sticker by editing a message incase of a typo
client.on('messageUpdate', (oldMessage, newMessage) => {
	if(/^:[a-zA-Z0-9-]+:$/.test(newMessage.content.trim())) sendSticker(newMessage);
});

//Update guild info (specifically managerIds) when a guildMember is updated
client.on('guildMemberUpdate', (oldMember, newMember) => {
	if(newMember.user.id != client.user.id) updateGuildInfo(newMember.guild);
});

client.login(covert.discord.bot_token);