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
		StickerPack.find({})
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

		let user = docs[0];
		let packs = docs[1];
		let guild = (docs[2]) ? docs[2] : null;

		let relevantPacks = packs;

		//Array of stickers available for command
		let stickers = user.customStickers.map(sticker=>{
			sticker.name = `-${sticker.name}`;
			return sticker;
		});
		let packKeys = user.stickerPacks;
		if(guild){	
			stickers = stickers.concat(guild.customStickers);
			packKeys = packKeys.concat(guild.stickerPacks);
		}

		relevantPacks = relevantPacks.filter(pack=>{
			return packKeys.includes(pack.key);
		});

		relevantPacks.forEach(pack=>{
			pack.stickers.forEach(sticker=>{
				sticker.name = `${pack.key}-${sticker.name}`;
			});
			stickers = stickers.concat(pack.stickers);
		});

		//if message matches sticker
		if( stickers.map(s=>s.name).includes(command) ){

			//Send sticker
			let index = stickers.map(s=>s.name).indexOf(command);	
			message.channel.sendFile(
				stickers[index].url,
				`${command}.png`,
				`**${util.authorDisplayName(message)}:**`
			);

			//Add sticker to guild recents array
			if(guild && command[0] != '-'){
				guild.recentStickers = updateRecentStickers(guild.recentStickers, command);
				guild.save();
			}

			//Delete message that was sent to trigger response
			if(message.channel.type == 'text'){
				message.delete()
				.catch(err=>{
					console.log(`Unable to delete message on guild: ${guild.id}`);
				});
			}

		}

	}).catch(err => util.handleError(err, message));

}