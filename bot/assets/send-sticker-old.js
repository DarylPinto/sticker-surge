const mongoose = require('mongoose');
const util = require('./utility-functions.js');

//Mongo Models
const Guild = require('../../models/guild.js');
const User = require('../../models/user.js');
const StickerPack = require('../../models/sticker-pack.js');

//Add value to beginning of array, array max length is 3, only one of each value
function updateRecentStickers(array, value){
	if(array.includes(value)){
		let index = array.indexOf(value);
		array.splice(index, 1);
	}
	array.unshift(value);
	return array.slice(0,3);
}

module.exports = function(message){

	let command = message.content.toLowerCase().replace(/:/g, '');	
	let stickers = [];
	let user = null;
	let guild = null;

	let documentArray = [
		User.findOneAndUpdate(
			{id: message.author.id},
			{
				id: message.author.id,
				username: message.author.username,
				avatarURL: message.author.avatarURL
			},
			{upsert: true,	new: true, setDefaultsOnInsert: true}
		),
	];
	if(message.channel.type == 'text'){
		documentArray.push(
			Guild.findOneAndUpdate(
				{id: message.channel.guild.id},
				{id: message.channel.guild.id},
				{upsert: true,	new: true, setDefaultsOnInsert: true}
			)
		);
	}

	Promise.all(documentArray)
	.then(docs => {

		user = docs[0];
		guild = (docs[1]) ? docs[1] : null;

		//Push custom stickers into stickers array
		user.customStickers.forEach(sticker=>{
			let stickerCopy = util.cloneObj(sticker._doc);
			stickerCopy.name = '-'+stickerCopy.name;	
			stickers.push(stickerCopy);
		});

		if(guild) stickers = stickers.concat(guild.customStickers);

		//Find sticker packs used by the user & guild
		let stickerPackKeys = user.stickerPacks;
		if(guild) stickerPackKeys = stickerPackKeys.concat(guild.stickerPacks);

		//Remove duplicates from sticker pack keys array
		return stickerPackKeys.filter( (elem, index, arr) => {
			return index == arr.indexOf(elem);
		});

	})
	.then(stickerPackKeys => {
		return StickerPack.find({'key': {$in: stickerPackKeys} });
	})
	.then(stickerPacks => {

		//Push sticker pack stickers into sticker array
		stickerPacks.forEach(pack=>{
			pack.stickers.forEach(sticker=>{
				let stickerCopy = util.cloneObj(sticker._doc);
				stickerCopy.name = pack.key + '-'+stickerCopy.name;
				stickers.push(stickerCopy);
			});
		});

		//console.log(stickers.map(s=>s.name));

		//if message matches sticker
		if( stickers.map(s=>s.name).includes(command) ){

			//Increment sticker usage count
			if(command.indexOf('-') == 0){ //user sticker
				let stickerName = command.slice(1);
				let index = user.customStickers.map(s=>s.name).indexOf(stickerName);
				user.customStickers[index].uses++;
				user.save();
			}else if(command.indexOf('-') == -1){ //guild sticker
				let index = guild.customStickers.map(s=>s.name).indexOf(command);
				guild.customStickers[index].uses++;
				guild.save();
			}else if(command.indexOf('-') > 0){ //sticker pack sticker
				let hyphenIndex = command.indexOf('-');
				let stickerName = command.slice(hyphenIndex + 1);
				let packKey = command.slice(0, hyphenIndex);
				let stickerPack = stickerPacks.filter(pack=>{
					return pack.key == packKey;
				})[0];
				let index = stickerPack.stickers.map(s=>s.name).indexOf(stickerName);
				stickerPack.stickers[index].uses++;
				stickerPack.save();
			}

			//Send sticker
			let index = stickers.map(s=>s.name).indexOf(command);	
			message.channel.sendFile(
				stickers[index].url,
				`${command}.png`,
				`**${util.authorDisplayName(message)}:**`
			);

			//Delete message that was sent to trigger response, and save guild recentStickers
			if(message.channel.type == 'text'){

				if(command[0] != '-'){
					guild.recentStickers = updateRecentStickers(guild.recentStickers, command);
					guild.save();
				}

				message.delete()
				.catch(err=>{
					console.log(`Unable to delete message on guild: ${guild.id}`);
				});
			}

		}

	}).catch(err => util.handleError(err, message));

}