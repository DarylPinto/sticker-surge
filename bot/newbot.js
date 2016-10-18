/*********************/
/*******GLOBALS*******/
/*********************/

//Node Modules
const Discord = require('discord.js');
const mongoose = require('mongoose');

//Assets
const util = require('./utility-functions');
const special = require('./special.json');
const replies = require('./replies.js');

//Mongo Models
const Guild = require('../models/guild');
const User = require('../models/user');
const StickerPack = require('../models/sticker-pack');

//Bot/DB/CDN Setup 
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/test');
const db = mongoose.connection;
const client = new Discord.Client();
db.on('error', err => util.handleError(err));

//Bot commands
const commands = {
	'stickers': require('./commands/provide-sticker-info.js'),
	'addsticker': require('./commands/add-sticker.js'),
	//'removesticker': require('./commands/remove-sticker.js'),
	//'setprefix': require('./commands/set-prefix.js'),
	'setrole': require('./commands/set-role.js')
}

/********************/
/*****BOT EVENTS*****/
/********************/

//Start bot
client.on('ready', () => {
  console.log('I am ready!');
});

//When message is sent
client.on('message', message => {

	let messageWords = message.content.toLowerCase().trim().split(' ');
	let firstWord = messageWords[0];
	
	//Ensure Message contains command
	let messageHasCommand = Object.keys(commands).some(command=>{
		return firstWord.endsWith(command);
	});
	if(!messageHasCommand) return false;

	//DM Messages
	if(message.channel.type == 'dm'){

		User.findOneAndUpdate(
			{id: message.author.id},
			{
				id: message.author.id,
				username: message.author.username,
				avatarURL: message.author.avatarURL
			},
			{upsert: true,	new: true, setDefaultsOnInsert: true}
		)
		.then(dbUser => {

			//Commands

			if(firstWord.endsWith('stickers')) commands.stickers(message, dbUser)

			else if(firstWord.endsWith('addsticker')) commands.addsticker(message, dbUser)

			//else if(firstWord.endsWith('removesticker')) commands.removesticker(message, dbUser)

			//else commands.help(message, dbUser)

		}).catch(err => util.handleError(err, message));

	}

	//Guild Messages
	else if(message.channel.type == 'text'){

		Guild.findOneAndUpdate(
			{id: message.channel.guild.id},
			{id: message.channel.guild.id},
			{upsert: true,	new: true, setDefaultsOnInsert: true}
		)
		.then(dbGuild => {

			let prefix = dbGuild.prefix;
			//Ensure following commands start with prefix
			if(!firstWord.startsWith(prefix)) return false;

			//Commands

			if(firstWord.slice(prefix.length) == 'stickers'){
				commands.stickers(message, dbGuild);
				return true;
			}

			if(util.msgHasRole(message, dbGuild.managerRole)){

				if(firstWord.slice(prefix.length) == 'addsticker'){
					commands.addsticker(message, dbGuild);
				}

				if(firstWord.slice(prefix.length) == 'setrole'){
					commands.setrole(message, dbGuild);
				}

			}else{
				replies.use(message, 'insufficientPermission', {'%%ROLE%%': dbGuild.managerRole});
				return false
			}

		}).catch(err => util.handleError(err));

	}


});

client.login(special.token);