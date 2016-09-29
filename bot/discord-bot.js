const Discord = require('discord.js');
const base62 = require('base62');
const util = require('./utility-functions');
const token = require('./token.json');
const mongoose = require('mongoose');
const replies = require('./replies.js');
const client = new Discord.Client();

//set es2015 promises as mongoose promise lib
mongoose.Promise = global.Promise;

//connect to database	
mongoose.connect('mongodb://localhost/test');
let db = mongoose.connection;

//Bot crashes by design if it cannot connect to db
//(because it's useless otherwise)
db.on('error', err => {
	util.handleError(err);
});

//get mongo models... (Why mongo models? -Zoolander)
let Guild = require('../models/guild');
let Sticker = require('../models/sticker');
let StickerPack = require('../models/sticker-pack');

//Start bot
client.on('ready', () => {
  console.log('I am ready!');
});

//When bot joins a guild for the first time
client.on('guildCreate', guild => {

	//MAKE SURE TO CHECK IF DB HAS INFO FOR THIS GUILD ALREADY,
	//DONT WANT TO OVERWRITE GUILD'S STICKERS IF BOT IS KICKED THEN RE-ADDED
	//try upsert https://docs.mongodb.com/manual/reference/method/db.collection.update/#upsert-parameter

	let currentGuild = new Guild({
		id: guild.id,
		managerRole: '@everyone',
		customStickers: [],
		stickerPackPrefixes: []
	});

	currentGuild.save(function(err){
		if(err) util.handleError(err);
		console.log('Guild added to db!');
	});

});

//When message is sent
client.on('message', message => {

	let prefix = '$';
	let command = util.getCommand(prefix, message);

	switch(command){

		case('addsticker'):

			if(message.channel.type == 'text'){
				Guild.findOne({id: message.channel.guild.id})
				.then(res =>{
					addSticker(prefix, message, res);
				})
				.catch(err=>{
					util.handleError(err, message); //check that this works
				});

			}else{
				User.findOne({id: message.author.id}, (err, res) => {
					if(err) util.handleError(err, message);
					addPersonalSticker(prefix, message, res); //create seperate function for personal stickers
				})
			}
			break;

		case('removesticker'):
			Guild.findOne({id: message.channel.guild.id}, (err, res) => {
				if(err) util.handleError(err, message);
				removeSticker(prefix, message, res);
			});
			break;

		case('stickers'):
			Guild.findOne({id: message.channel.guild.id}, (err, res) => {
				if(err) util.handleError(err, message);
				provideStickerInfo(message, res);
			});
			break;

		case('help'):
			message.channel.sendMessage(replies.use('groupHelp', {'%%PREFIX%%': prefix}));
			break;

		case('setrole'):
			Guild.findOne({id: message.channel.guild.id}, (err, res) => {
				if(err) util.handleError(err, message);
				setRole(prefix, message, res);
			});	
			break;

		default:
			//do nothing
			break;

	}
	
});

/**
* Adds a sticker.
*
* @param {message object} message - message that triggered the bot
*/
function addSticker(prefix, message, guildInfo){
	let messageWords = message.content.trim().split(' ');
	let stickerName, stickerURL;

	//Make sure user has proper permissions, determine
	//sticker name, sticker URL and validate syntax
	if(message.channel.type == 'text' && !util.msgHasRole(message, guildInfo.managerRole)){

		message.channel.sendMessage(replies.use('insufficientPermission', {'%%ROLE%%': guildInfo.managerRole}));
		return false;

	}else if(messageWords.length == 2 && util.msgHasImgAttached(message)){
		stickerURL = message.attachments.array()[0].proxyURL;
	}else if(messageWords.length == 3 && util.linkIsDirectImg(messageWords[2]) && !util.msgHasImgAttached(message)){
		stickerURL = messageWords[2];
	}else{
		message.channel.sendMessage(replies.use('invalidAddSyntax', {'%%PREFIX%%': prefix}));
		return false; 
	}
	stickerName = messageWords[1];
	

	//Determine if sticker is personal or group
	if(message.channel.type == 'dm'){
		message.channel.sendMessage(replies.use('addPersonalSticker', {'%%STICKERNAME%%': stickerName}));
		//add sticker to db
	}else if(message.channel.type == 'text' && util.msgHasRole(message, groupStickerRole)){
		message.channel.sendMessage(replies.use('addGroupSticker', {'%%STICKERNAME%%': stickerName}));
		//add sticker to db
	}else{
		message.channel.sendMessage(replies.unknownError);
	}

}

/**
* Removes a sticker.
*
* @param {message object} message - message that triggered the bot
*/
function removeSticker(prefix, message, guildInfo){
	let messageWords = message.content.trim().split(' ');
	let stickerName;

	//Make sure user has correct permissions
	if(message.channel.type == 'text' && !util.msgHasRole(message, guildInfo.managerRole)){
		message.channel.sendMessage(replies.use('insufficientPermission', {'%%ROLE%%': guildInfo.managerRole}));
		return false;
	}else if(messageWords.length != 2){
		message.channel.sendMessage(replies.use('invalidRemoveSyntax', {'%%PREFIX%%': prefix}));
		return false;
	}

	stickerName = messageWords[1];

	if(message.channel.type == 'dm'){
		message.channel.sendMessage(replies.use('removePersonalSticker', {'%%STICKERNAME%%': stickerName}));
		//remove sticker from db
	}else if(message.channel.type == 'text' && util.msgHasRole(message, groupStickerRole)){
		message.channel.sendMessage(replies.use('removeGroupSticker', {'%%STICKERNAME%%': stickerName}));
		//remove sticker from db
	}else{
		message.channel.sendMessage(replies.unknownError);
	}

}

/**
* Tells the user the most recently used stickers, links them to a list of available stickers, and 
* provides help command
*
* @param {message object} message - message that triggered the bot
*/
function provideStickerInfo(message, guildInfo){
	if(message.channel.type == 'dm'){
		let base62userid = base62.encode(parseInt(message.author.id));
		message.channel.sendMessage(replies.use('personalStickerInfo', {'%%BASE62USERID%%': base62userid}));	
	}else if(message.channel.type == 'text'){
		let base62guildid = base62.encode(message.guild.id);
		message.channel.sendMessage(replies.use('groupStickerInfo', {
			'%%BASE62GUILDID%%': base62guildid,
			'%%RECENTSTICKERS%%': guildInfo.recentStickers.map(s=>`:${s}:`).join(', ')
		}));
	}

}

function setRole(prefix, message, guildInfo){

	let messageWords = message.content.trim().split(' ');

	//Make sure user has correct permissions
	if(message.channel.type == 'text' && !util.msgHasRole(message, guildInfo.managerRole)){

		message.channel.sendMessage(replies.use('insufficientPermission', {'%%ROLE%%': guildInfo.managerRole}));
		return false;

	}else if(messageWords.length != 2){

		message.channel.sendMessage(replies.use('invalidSetRoleSyntax', {'%%PREFIX%%': prefix}));
		return false;

	}else{

		//If role is set to 'everyone', change it to '@everyone'
		let newRole = (messageWords[1].toLowerCase() === 'everyone') ? '@everyone' : messageWords[1].toLowerCase();
		guildInfo.managerRole = newRole;

		guildInfo.save()
		.then(() => {

			if(newRole === '@everyone'){
				message.channel.sendMessage(replies.use('setRoleEveryone'));	
			}else{
				message.channel.sendMessage(replies.use('setRole', {'%%NEWROLE%%': newRole}));		
			}

			console.log(guildInfo);
		})
		.catch(err => {
			util.handleError(err, message);
		})

	}
}

client.login(token.value);