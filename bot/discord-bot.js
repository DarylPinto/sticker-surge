const Discord = require('discord.js');
const base62 = require('base62');
const util = require('./utility-functions');
const special = require('./special.json');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary');
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
let User = require('../models/user');
//let Sticker = require('../models/sticker');
let StickerPack = require('../models/sticker-pack');

//connect to cloudinary
cloudinary.config(special.cloudinary);

//Create dictionary of guilds and their chosen prefixes/manager roles
//(Must be stored in memory so that a db call
//on EVERY sent message is not necessary to determine
//if the message begins with the prefix or user has correct premission
let guildSettings = new Object();

Guild.find({})
	.then(res=>{
		res.forEach(guild=>{
			guildSettings[guild.id] = {
				prefix: guild.prefix,
				managerRole: guild.managerRole
			}
		});
	}).catch(err=>{
		util.handleError(err);
	});

//Start bot
client.on('ready', () => {
  console.log('I am ready!');
});

//When bot is added to a guild
client.on('guildCreate', guild => {

	//Add guild to DB if it's not there already
	Guild.update(
		{id: guild.id},
		{$setOnInsert: {id: guild.id}},
		{upsert: true, setDefaultsOnInsert: true}
	)
	.then(res=>{
		guildSettings[res.id].prefix = res.prefix;
		res.save();
	})
	.catch(err=>{
		util.handleError(err);
	});

});

//When message is sent
client.on('message', message => {

	let prefix;
	let managerRole;

	if(message.channel.type == 'text'){
		prefix = guildSettings[message.channel.guild.id].prefix;	
		managerRole = guildSettings[message.channel.guild.id].managerRole;
	}else{
		prefix = '';
	}	

	let command = util.getCommand(prefix, message);

	switch(command){

		case('addsticker'):

			//Determine the sticker name and sticker URL
			let messageWords = message.content.trim().split(' ');
			let stickerName, stickerURL;

			if(message.channel.type == 'text' && !util.msgHasRole(message, managerRole)){
				message.channel.sendMessage(replies.use('insufficientPermission', {'%%ROLE%%': managerRole}));
				return false;
			}else if(messageWords.length < 2 || (!util.msgHasImgAttached(message) && messageWords.length != 3) || !util.linkIsDirectImg(messageWords[2])){
				message.channel.sendMessage(replies.use('invalidAddSyntax', {'%%PREFIX%%': prefix}));
				return false; 
			}else{
				stickerName = messageWords[1];
				if(util.msgHasImgAttached(message)){
					stickerURL = message.attachments.array()[0].proxyURL;
				}else{
					stickerURL = messageWords[2];
				}
			}

			//Add Sticker
			if(message.channel.type == 'text'){
				addGuildSticker(message, stickerName, stickerURL);
			}else if(message.channel.type == 'dm'){
				addPersonalSticker(message, stickerName, stickerURL);
			}

			break;

		case('removesticker'):
			removeSticker(prefix, message);
			break;

		case('stickers'):
			provideStickerInfo(message, res);
			break;

		case('help'):	
			giveHelp(prefix, message);
			break;

		case('setrole'):

			if(message.channel.type != 'text'){
				giveHelp(prefix, message);
				return false;
			}

			Guild.findOne({id: message.channel.guild.id}, (err, res) => {
				if(err) util.handleError(err, message);
				setRole(prefix, message, res);
			});	
			break;

		case('setprefix'):

			if(message.channel.type != 'text'){
				giveHelp(prefix, message);
				return false;
			}

			Guild.findOne({id: message.channel.guild.id}, (err, res) => {
				if(err) util.handleError(err, message);
				setPrefix(prefix, message, res);
			});	
			break;

		default:
			if(message.channel.type == 'dm' && message.author.id != client.user.id){
				message.channel.sendMessage('Unknown command.');
				message.channel.sendMessage(replies.use('personalHelp', {'%%PREFIX%%': prefix}));
			}else{
				//do nothing (yes, i know this line isn't necessary. It's for clarity's sake)
			}
			break;

	}
	
});

/**
* Adds a sticker to the guild 
*
* @param {message object} message - message that triggered the bot
* @param {string} stickerName - name of the sticker
* @param {string} stickerURL - URL of the sticker
*/
function addGuildSticker(message, stickerName, stickerURL){

	Promise.all([
		Guild.findOne({id: message.channel.guild.id}),
		cloudinary.uploader.upload(stickerURL)
	])	
	.then(values =>{

		let cloudURL = values[1].url;
		let maxHeight = 300;
		let maxWidth = 300;

		//If uploaded image is bigger than limits set above, save a size-modified cloudinary URL
		if(values[1].height > maxHeight || values[1].width > maxWidth){
			let temp = cloudURL.split('/image/upload/');
			cloudURL = temp.join(`/image/upload/w_${maxWidth.toString()},h_${maxHeight.toString()},c_fit/`);	
		}

		let currentGuild = values[0];

		//check if sticker exists
		let stickerExists = false;
		currentGuild.customStickers.forEach(s=>{
			if(s.name == stickerName) stickerExists = true;
		});

		if(stickerExists){
			message.channel.sendMessage(replies.use('stickerAlreadyExists'));
		}else{
			currentGuild.customStickers.push({
				name: stickerName,
				url: cloudURL,
				uses: 0,
				createdAt: new Date()
			});
			currentGuild.save(()=>{
				message.channel.sendMessage(replies.use('addGroupSticker', {
					'%%STICKERNAME%%': stickerName
				}));
			});
		}

	}).catch(err=>{
		util.handleError(err, message);
	});

}

/**
* Adds a personal sticker that can be used in any guild 
*
* @param {message object} message - message that triggered the bot
* @param {string} stickerName - name of the sticker
* @param {string} stickerURL - URL of the sticker
*/
function addPersonalSticker(message, stickerName, stickerURL){

	Promise.all([
		User.findOneAndUpdate(
			{id: message.author.id},
			{
				id: message.author.id,
				username: message.author.username,
				avatarURL: message.author.avatarURL
			},
			{upsert: true,	new: true, setDefaultsOnInsert: true}
		),
		cloudinary.uploader.upload(stickerURL)
	])	
	.then(values =>{

		let cloudURL = values[1].url;
		let maxHeight = 300;
		let maxWidth = 300;

		//If uploaded image is bigger than limits set above, save a size-modified cloudinary URL
		if(values[1].height > maxHeight || values[1].width > maxWidth){
			let temp = cloudURL.split('/image/upload/');
			cloudURL = temp.join(`/image/upload/w_${maxWidth.toString()},h_${maxHeight.toString()},c_fit/`);	
		}

		let user = values[0];

		//check if sticker exists
		let stickerExists = false;
		user.customStickers.forEach(s=>{
			if(s.name == stickerName) stickerExists = true;
		});

		if(stickerExists){
			message.channel.sendMessage(replies.use('stickerAlreadyExists'));
		}else{
			user.customStickers.push({
				name: stickerName,
				url: cloudURL,
				uses: 0,
				createdAt: new Date()
			});
			user.save(()=>{
				message.channel.sendMessage(replies.use('addPersonalSticker', {
					'%%STICKERNAME%%': stickerName
				}));
			});
		}

	}).catch(err=>{
		util.handleError(err, message);
	});

}

/**
* Removes a sticker.
*
* @param {message object} message - message that triggered the bot
*/
function removeSticker(prefix, message){
	let messageWords = message.content.trim().split(' ');
	let stickerName;

	//Make sure user has correct permissions
	if(message.channel.type == 'text' && !util.msgHasRole(message, currentGuild.managerRole)){
		message.channel.sendMessage(replies.use('insufficientPermission', {'%%ROLE%%': currentGuild.managerRole}));
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
function provideStickerInfo(message, currentGuild){
	if(message.channel.type == 'dm'){
		let base62userid = base62.encode(parseInt(message.author.id));
		message.channel.sendMessage(replies.use('personalStickerInfo', {'%%BASE62USERID%%': base62userid}));	
	}else if(message.channel.type == 'text'){
		let base62guildid = base62.encode(message.channel.guild.id);
		message.channel.sendMessage(replies.use('groupStickerInfo', {
			'%%BASE62GUILDID%%': base62guildid,
			'%%RECENTSTICKERS%%': currentGuild.recentStickers.map(s=>`:${s}:`).join(', ')
		}));
	}

}

function giveHelp(prefix, message){
	if(message.channel.type === 'text'){
		message.channel.sendMessage(replies.use('groupHelp', {'%%PREFIX%%': prefix}));	
	}else{
		message.channel.sendMessage(replies.use('personalHelp', {'%%PREFIX%%': prefix}));	
	}
}

function setRole(prefix, message, currentGuild){

	let messageWords = message.content.trim().split(' ');
	let maxRoleNameLength = 32;

	//Make sure user has correct permissions
	if(message.channel.type == 'text' && !util.msgHasRole(message, currentGuild.managerRole)){

		message.channel.sendMessage(replies.use('insufficientPermission', {'%%ROLE%%': currentGuild.managerRole}));
		return false;

	}else if(messageWords.length != 2){

		message.channel.sendMessage(replies.use('invalidSetRoleSyntax', {'%%PREFIX%%': prefix}));
		return false;

	}else if(messageWords[1].length > maxRoleNameLength){

		message.channel.sendMessage(replies.use('invalidRoleNameLength', {'%%MAXLENGTH%%': maxRoleNameLength}));
		return false;

	}else{

		//If role is set to 'everyone', change it to '@everyone'
		let newRole = (messageWords[1].toLowerCase() === 'everyone') ? '@everyone' : messageWords[1].toLowerCase();
		currentGuild.managerRole = newRole;

		currentGuild.save()
		.then(() => {

			guildSettings[message.channel.guild.id].managerRole = newRole;

			if(newRole === '@everyone'){
				message.channel.sendMessage(replies.use('setRoleEveryone'));	
			}else{
				message.channel.sendMessage(replies.use('setRole', {'%%NEWROLE%%': newRole}));		
			}

		})
		.catch(err => {
			util.handleError(err, message);
		})

	}
}

function setPrefix(prefix, message, currentGuild){

	let messageWords = message.content.trim().split(' ');
	let maxPrefixLength = 3;
	let illegalCharacters = ['@', '#'];

	//Make sure user has correct permissions
	if(message.channel.type == 'text' && !util.msgHasRole(message, currentGuild.managerRole)){

		message.channel.sendMessage(replies.use('insufficientPermission', {'%%ROLE%%': currentGuild.managerRole}));
		return false;

	}else if(messageWords.length < 2){

		message.channel.sendMessage(replies.use('invalidSetPrefixSyntax', {'%%PREFIX%%': prefix}));
		return false;

	}else if( messageWords[1] === prefix){
		
		message.channel.sendMessage(replies.use('prefixAlreadySet', {'%%PREFIX%%': prefix}));
		return false;

	}else if(messageWords[1].length > maxPrefixLength){

		message.channel.sendMessage(replies.use('invalidSetPrefixLength', {'%%MAXLENGTH%%': maxPrefixLength}));
		return false;

	}else if( illegalCharacters.indexOf(messageWords[1][0]) > -1){
		
		message.channel.sendMessage(replies.use('invalidSetPrefixCharacter', {
			'%%ILLEGALCHARACTERS%%': illegalCharacters.map(c=>'`'+c+'`').join(' ')
		}));
		return false;

	}else if(message.channel.type == 'text'){	

		currentGuild.prefix = messageWords[1];
		currentGuild.save(()=>{
			guildSettings[message.channel.guild.id].prefix = messageWords[1];
			message.channel.sendMessage(replies.use('setPrefix', {
				'%%NEWPREFIX%%': messageWords[1], 
				'%%PREFIX%%': prefix
			}));
		});

	}

}

client.login(special.token);