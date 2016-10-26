/*********************/
/*******GLOBALS*******/
/*********************/

//Node Modules
const Discord = require('discord.js');
const mongoose = require('mongoose');

//Assets
const util = require('./assets/utility-functions.js');
const replies = require('./assets/replies.js');
const sendSticker = require('./assets/send-sticker.js');
const special = require('../common/assets/special.json');

//Mongo Models
const Guild = require('../common/models/guild.js');
const User = require('../common/models/user.js');

//Bot/DB Init
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/test');
const db = mongoose.connection;
db.on('error', err => util.handleError(err));
const client = new Discord.Client();

//Bot commands
const commands = {
	'stickers': require('./commands/stickers.js'),
	'createsticker': require('./commands/createsticker.js'),
	'deletesticker': require('./commands/deletesticker.js'),
	'addstickerpack': require('./commands/addstickerpack.js'),
	'removestickerpack': require('./commands/removestickerpack.js'),
	'setprefix': require('./commands/setprefix.js'),
	'setrole': require('./commands/setrole.js'),
	'help': require('./commands/help.js')
}

/********************/
/*****BOT EVENTS*****/
/********************/

//Start bot
client.on('ready', () => {
  console.log('Discord Stickers bot is online!');
});

//When message is sent
function respondToMessage(message){

	////////////
	//Stickers//
	////////////
	if( /^:[a-zA-Z0-9-]+:$/.test(message.content.trim()) ){
		sendSticker(message);
		return false;
	}

	////////////////
	//Bot commands//
	////////////////
	let messageWords = message.content.toLowerCase().trim().split(' ');
	let firstWord = messageWords[0];
	let messageHasCommand = Object.keys(commands).some(command=>{
		return firstWord.endsWith(command);
	});

	//DM Messages
	if(message.channel.type == 'dm'){

		//Stop immediately if message was sent by this bot and not user
		if(message.author.id == client.user.id) return false;

		//Give help if message doesn't contain a valid command
		if(!messageHasCommand){
			message.channel.sendMessage('Unknown command. Here is a list of commands I recognize:');
			commands.help(message);
			return false;
		}

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
			if(firstWord.endsWith('stickers')) commands.stickers(message, dbUser);

			else if(firstWord.endsWith('createsticker')) commands.createsticker(message, dbUser);

			else if(firstWord.endsWith('deletesticker')) commands.deletesticker(message, dbUser);

			else if(firstWord.endsWith('addstickerpack')) commands.addstickerpack(message, dbUser);

			else if(firstWord.endsWith('removestickerpack')) commands.removestickerpack(message, dbUser);

			else if(firstWord.endsWith('help')) commands.help(message, dbUser);

		}).catch(err => util.handleError(err, message));

	}

	//Guild Messages
	else if(message.channel.type == 'text'){

		//Don't proceed if message doesn't contain command
		if(!messageHasCommand) return false;

		Guild.findOneAndUpdate(
			{id: message.channel.guild.id},
			{id: message.channel.guild.id},
			{upsert: true,	new: true, setDefaultsOnInsert: true}
		)
		.then(dbGuild => {

			let prefix = dbGuild.prefix;

			//Don't proceed if message doesn't contain begin with prefix
			if(!firstWord.startsWith(prefix)) return false;


			//Commands
			if(firstWord.slice(prefix.length) == 'stickers'){
				commands.stickers(message, dbGuild);
			}

			else if(firstWord.slice(prefix.length) == 'help'){
				commands.help(message, dbGuild);
			}			

			else if(util.msgHasRole(message, dbGuild.managerRole)){

				if(firstWord.slice(prefix.length) == 'createsticker'){
					commands.createsticker(message, dbGuild);
				}

				if(firstWord.slice(prefix.length) == 'deletesticker'){
					commands.deletesticker(message, dbGuild);
				}

				if(firstWord.slice(prefix.length) == 'addstickerpack'){
					commands.addstickerpack(message, dbGuild);
				}

				if(firstWord.slice(prefix.length) == 'removestickerpack'){
					commands.removestickerpack(message, dbGuild);
				}

				if(firstWord.slice(prefix.length) == 'setrole'){
					commands.setrole(message, dbGuild);
				}

				if(firstWord.slice(prefix.length) == 'setprefix'){
					commands.setprefix(message, dbGuild);
				}

			}else{
				replies.use(message, 'insufficientPermission', {'%%ROLE%%': dbGuild.managerRole});
				return false
			}

		}).catch(err => util.handleError(err));

	}

}

client.on('message', message => {
	respondToMessage(message);
});

client.on('messageUpdate', (oldMessage, newMessage) => {
	respondToMessage(newMessage);
});

client.login(special.token);