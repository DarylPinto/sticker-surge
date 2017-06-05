const Discord = require('discord.js');
const client = new Discord.Client();
const covert = require('../covert.js');

//////////
//Events//
//////////
const sendSticker = require('./events/send-sticker.js');
const initGuild = require('./events/init-guild.js');
const deactivateGuild = require('./events/deactivate-guild.js');
const updateGuildInfo = require('./events/update-guild-info.js');

////////////////
//Bot commands//
////////////////
const commands = {
	//'stickers': require('./commands/stickers.js'),
	'createsticker': require('./commands/create-sticker.js'),
	//'deletesticker': require('./commands/delete-sticker.js'),
	//'addstickerpack': require('./commands/add-stickerpack.js'),
	//'removestickerpack': require('./commands/remove-stickerpack.js'),
	//'setprefix': require('./commands/setp-refix.js'),
	//'setrole': require('./commands/set-role.js'),
	//'help': require('./commands/help.js')
}

//Listen for posting stickers or using commands
client.on('message', message => {

	////////////
	//Stickers//
	////////////
	if( /^:[a-zA-Z0-9-]+:$/.test(message.content.trim()) ){
		sendSticker(message);
		return false;
	}

	////////////
	//Commands//
	////////////
	let messageWords = message.content.toLowerCase().trim().split(' ');
	let firstWord = messageWords[0];
	let messageHasCommand = Object.keys(commands).some(command=>{
		return firstWord.endsWith(command);
	});

	if(message.channel.type == 'text'){

		if(!messageHasCommand) return false;

		if(firstWord.endsWith('createsticker')) commands.createsticker(message);

	}

	//TODO: When manager role is updated with !setrole, call updateGuildInfo to re-check for managerIds

});

//Allow user to post sticker by editing a message incase of a typo
client.on('messageUpdate', (oldMessage, newMessage) => {
	if(/^:[a-zA-Z0-9-]+:$/.test(newMessage.content.trim())) sendSticker(newMessage);
});

//Add guild to db for the first time
client.on('guildCreate', guild => initGuild(guild));

//Set isActive flag to false in db when bot leaves guild
client.on('guildDelete', guild => deactivateGuild(guild));

//Update guild info (specifically managerIds) when a guildMember is updated
client.on('guildMemberUpdate', (oldMember, newMember) => {
	if(newMember.user.id != client.user.id) updateGuildInfo(newMember.guild);
});


client.on('ready', () => console.log('Discord Stickers bot is online!'));

client.login(covert.discord.bot_token);