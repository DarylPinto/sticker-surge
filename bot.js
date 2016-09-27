const Discord = require('discord.js');
const base62 = require('base62');
const util = require('./utility-functions');
const token = require('./token.json');
const replies = require('./replies.json');
const client = new Discord.Client();

client.on('ready', () => {
  console.log('I am ready!');
});

client.on('message', message => {
	
	let command = util.getCommand('$', message);

	if(command === 'addsticker'){
  	addSticker(message);
	}else if(command === 'removesticker'){
		removeSticker(message);
	}else if(command === 'stickers'){
		provideStickerInfo(message);
	}else if(command === 'help'){
		help(message);
	}
	
});

/**
* Adds a sticker.
*
* @param {message object} message - message that triggered the bot
*/
function addSticker(message){
	let messageWords = message.content.trim().split(' ');
	let stickerName, stickerURL;
	let groupStickerRole = 'sticker-artist';

	//Make sure user has proper permissions, determine
	//sticker name, sticker URL and validate syntax
	if(message.channel.type == 'text' && !util.msgHasRole(message, groupStickerRole)){
		message.channel.sendMessage(replies.insufficientPermission.replace('%%ROLE%%', groupStickerRole));
		return false;
	}else if(messageWords.length == 2 && util.msgHasImgAttached(message)){
		stickerURL = message.attachments.array()[0].proxyURL;
	}else if(messageWords.length == 3 && util.linkIsDirectImg(messageWords[2]) && !util.msgHasImgAttached(message)){
		stickerURL = messageWords[2];
	}else{
		message.channel.sendMessage(replies.invalidAddSyntax);
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
function removeSticker(message){
	let messageWords = message.content.trim().split(' ');
	let stickerName;
	let groupStickerRole = 'sticker-artist';

	//Make sure user has correct permissions
	if(message.channel.type == 'text' && !util.msgHasRole(message, groupStickerRole)){
		message.channel.sendMessage(replies.insufficientPermission.replace('%%ROLE%%', groupStickerRole));
		return false;
	}else if(messageWords.length != 2){
		message.channel.sendMessage(replies.invalidRemoveSyntax);
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
function provideStickerInfo(message){
	if(message.channel.type == 'dm'){
		let base62userid = base62.encode(parseInt(message.author.id));
		message.channel.sendMessage(replies.personalStickerInfo.replace('%%BASE62USERID%%', base62userid));	
	}else if(message.channel.type == 'text'){
		let base62serverid = base62.encode(message.guild.id);
		message.channel.sendMessage(replies.groupStickerInfo.replace('%%BASE62SERVERID%%', base62serverid).replace('%%RECENTSTICKERS%%', '`:test1:`, `:test2:`, `:test3`'));
	}

}

client.login(token.value);