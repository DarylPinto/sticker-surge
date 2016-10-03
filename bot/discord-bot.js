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
let Sticker = require('../models/sticker');
let StickerPack = require('../models/sticker-pack');

//connect to cloudinary
cloudinary.config(special.cloudinary);

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
		console.log(res);
	})
	.catch(err=>{
		console.err(err);
	});

});

//When message is sent
client.on('message', message => {

	let prefix = '$';
	let command = util.getCommand(prefix, message);

	switch(command){

		case('addsticker'):

			//Determine the sticker name and sticker URL
			let messageWords = message.content.trim().split(' ');
			let stickerName, stickerURL;

			if(messageWords.length < 2 || (!util.msgHasImgAttached(message) && messageWords.length != 3) || !util.linkIsDirectImg(messageWords[2])){
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
			removeSticker(prefix, message, res);
			break;

		case('stickers'):
			provideStickerInfo(message, res);
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
		User.update(
			{id: message.author.id},
			{$setOnInsert:{
				id: message.author.id,
				username: message.author.username,
				avatarURL: message.author.avatarURL
			}},
			{upsert: true, setDefaultsOnInsert: true}
		),
		cloudinary.uploader.upload(stickerURL)
	])	
	.then(values =>{

		//console.log(values);

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
function removeSticker(prefix, message, currentGuild){
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
		let base62guildid = base62.encode(message.guild.id);
		message.channel.sendMessage(replies.use('groupStickerInfo', {
			'%%BASE62GUILDID%%': base62guildid,
			'%%RECENTSTICKERS%%': currentGuild.recentStickers.map(s=>`:${s}:`).join(', ')
		}));
	}

}

function setRole(prefix, message, currentGuild){

	let messageWords = message.content.trim().split(' ');

	//Make sure user has correct permissions
	if(message.channel.type == 'text' && !util.msgHasRole(message, currentGuild.managerRole)){

		message.channel.sendMessage(replies.use('insufficientPermission', {'%%ROLE%%': currentGuild.managerRole}));
		return false;

	}else if(messageWords.length != 2){

		message.channel.sendMessage(replies.use('invalidSetRoleSyntax', {'%%PREFIX%%': prefix}));
		return false;

	}else{

		//If role is set to 'everyone', change it to '@everyone'
		let newRole = (messageWords[1].toLowerCase() === 'everyone') ? '@everyone' : messageWords[1].toLowerCase();
		currentGuild.managerRole = newRole;

		currentGuild.save()
		.then(() => {

			if(newRole === '@everyone'){
				message.channel.sendMessage(replies.use('setRoleEveryone'));	
			}else{
				message.channel.sendMessage(replies.use('setRole', {'%%NEWROLE%%': newRole}));		
			}

			console.log(currentGuild);
		})
		.catch(err => {
			util.handleError(err, message);
		})

	}
}

client.login(special.token);