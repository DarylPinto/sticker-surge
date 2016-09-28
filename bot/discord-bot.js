const Discord = require('discord.js');
const base62 = require('base62');
const util = require('./utility-functions');
const token = require('./token.json');
const mongoose = require('mongoose');
const replies = require('./replies.json');
const client = new Discord.Client();

//connect to database	
mongoose.connect('mongodb://localhost/test');
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

//get mongo models
let Guild = require('../models/guild');
let Sticker = require('../models/sticker');
let StickerPack = require('../models/sticker-pack');

//Start bot
client.on('ready', () => {
  console.log('I am ready!');
});

//When bot joins a guild for the first time
client.on('guildCreate', (guild) => {

	//MAKE SURE TO CHECK IF DB HAS INFO FOR THIS GUILD ALREADY,
	//DONT WANT TO OVERWRITE GUILD'S STICKERS IF BOT IS KICKED THEN RE-ADDED

	let currentGuild = new Guild({
		id: guild.id,
		managerRole: '@everyone',
		customStickers: [],
		stickerPackPrefixes: []
	});

	currentGuild.save(function(err){
		if(err) throw err;
		console.log('Guild added to db!');
	});

});

//When message is sent
client.on('message', message => {

	let prefix = '$';
	let command = util.getCommand(prefix, message);

	if(command === 'addsticker'){

		Guild.findOne({id: message.channel.guild.id}, (err, doc) =>{
			addSticker(prefix, message, doc);
		});	
		
	}else if(command === 'removesticker'){

		Guild.findOne({id: message.channel.guild.id}, (err, doc) =>{
			removeSticker(prefix, message, doc);
		});

	}else if(command === 'stickers'){	

		Guild.findOne({id: message.channel.guild.id}, (err, doc) =>{
			provideStickerInfo(message, doc);
		});

	}else if(command === 'help'){
		message.channel.sendMessage(util.multiReplace(replies.groupHelp, {'%%PREFIX%%': prefix}));
	}else if(command === 'setrole'){

		Guild.findOne({id: message.channel.guild.id}, (err, doc) =>{
			setRole(prefix, message, doc);
		});	

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

		message.channel.sendMessage(util.multiReplace(replies.insufficientPermission, {	
			'%%ROLE%%': guildInfo.managerRole
		}));
		return false;

	}else if(messageWords.length == 2 && util.msgHasImgAttached(message)){
		stickerURL = message.attachments.array()[0].proxyURL;
	}else if(messageWords.length == 3 && util.linkIsDirectImg(messageWords[2]) && !util.msgHasImgAttached(message)){
		stickerURL = messageWords[2];
	}else{
		message.channel.sendMessage(util.multiReplace(replies.invalidAddSyntax, {
			'%%PREFIX%%': prefix
		}));
		return false; 
	}
	stickerName = messageWords[1];
	

	//Determine if sticker is personal or group
	if(message.channel.type == 'dm'){
		message.channel.sendMessage(replies.addPersonalSticker.replace('%%STICKERNAME%%', stickerName));
		//add sticker to db
	}else if(message.channel.type == 'text' && util.msgHasRole(message, groupStickerRole)){
		message.channel.sendMessage(replies.addGroupSticker.replace('%%STICKERNAME%%', stickerName));
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
		message.channel.sendMessage(util.multiReplace(replies.insufficientPermission, {	
			'%%ROLE%%': guildInfo.managerRole
		}));
		return false;
	}else if(messageWords.length != 2){
		message.channel.sendMessage(util.multiReplace(replies.invalidRemoveSyntax, {
			'%%PREFIX%%': prefix
		}));
		return false;
	}

	stickerName = messageWords[1];

	if(message.channel.type == 'dm'){
		message.channel.sendMessage(replies.removePersonalSticker.replace('%%STICKERNAME%%', stickerName));
		//remove sticker from db
	}else if(message.channel.type == 'text' && util.msgHasRole(message, groupStickerRole)){
		message.channel.sendMessage(replies.removeGroupSticker.replace('%%STICKERNAME%%', stickerName));
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
		message.channel.sendMessage(replies.personalStickerInfo.replace('%%BASE62USERID%%', base62userid));	
	}else if(message.channel.type == 'text'){
		let base62guildid = base62.encode(message.guild.id);
		message.channel.sendMessage(util.multiReplace(replies.groupStickerInfo, {
			'%%BASE62GUILDID%%': base62guildid,
			'%%RECENTSTICKERS%%': guildInfo.recentStickers.map(s=>`:${s}:`).join(', ')
		}));
	}

}

function setRole(prefix, message, guildInfo){

	let messageWords = message.content.trim().split(' ');

	//Make sure user has correct permissions
	if(message.channel.type == 'text' && !util.msgHasRole(message, guildInfo.managerRole)){

		message.channel.sendMessage(util.multiReplace(replies.insufficientPermission, {	
			'%%ROLE%%': guildInfo.managerRole
		}));
		return false;

	}else if(messageWords.length != 2){

		message.channel.sendMessage(util.multiReplace(replies.invalidSetRoleSyntax, {
			'%%PREFIX%%': prefix
		}));
		return false;

	}else{

		let newRole = messageWords[1];
		guildInfo.managerRole = newRole;
		guildInfo.save((err)=>{
			if(err) throw err;
			message.channel.sendMessage(util.multiReplace(replies.setRole, {
				'%%NEWROLE%%': newRole
			}));
			console.log(guildInfo);
		});

	}
}

client.login(token.value);