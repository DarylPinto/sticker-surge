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

		//Find sticker packs used by the user & guild
		let stickerPackKeys = user.stickerPacks.map(p=>p.key);
		if(guild) stickerPackKeys = stickerPackKeys.concat(guild.stickerPacks.map(p=>p.key));

		//Remove duplicates from sticker pack keys array
		return stickerPackKeys.filter( (elem, index, arr) => {
			return index == arr.indexOf(elem);
		});

	})
	.then(stickerPackKeys => {
		console.log(stickerPackKeys);
		return StickerPack.find({'key': {$in: stickerPackKeys} });
	})
	.then(stickerPacks => {

		let sticker = null;
		let stickerParentDoc = null;

		/**STICKER PACK STICKER**/
		if(command.indexOf('-') > 0){
			let stickerName = command.slice(command.indexOf('-')+1);
			let packKey = command.slice(0, command.indexOf('-'));
			let stickerPack = stickerPacks.filter(p=>p.key == packKey)[0];

			stickerParentDoc = stickerPack;
			sticker = stickerPack.stickers.filter(s=>s.name == stickerName)[0];
		}
		/**USER STICKER**/
		else if(command.indexOf('-') > -1){
			let stickerName = command.slice(1);
			stickerParentDoc = user;
			sticker = user.customStickers.filter(s=>s.name == stickerName)[0];
		}
		/**GUILD STICKER**/
		else if(command.indexOf('-') == -1){
			stickerParentDoc = guild;
			sticker = guild.customStickers.filter(s=>s.name == command)[0];
		}

		//If command matches a sticker,
		if(sticker){

			//Send sticker
			message.channel.sendFile(
				sticker.url,
				`${command}.png`,
				`**${util.authorDisplayName(message)}:**`
			);

			//If guild channel,
			if(message.channel.type == 'text'){

				//Update guild recents array
				if(stickerParentDoc != user){
					guild.recentStickers = updateRecentStickers(guild.recentStickers, command);
					guild.save();
				}

				//Increment sticker use count
				sticker.uses++;
				stickerParentDoc.save();

				//Delete message that was sent to trigger response, and save guild recentStickers
				message.delete()
				.catch(err=>{
					console.log(`Unable to delete message on guild: ${guild.id}`);
				});

			}

		}

	}).catch(err => util.handleError(err, message));

}

/*TODO

Use sticker.__parentDoc to find parent doc instead of stickerParentDoc variable
check if sending a sticker with no hypen in it (guild style sticker) in a dm, causes a crash

*/