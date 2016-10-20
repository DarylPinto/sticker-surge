const mongoose = require('mongoose');
const util = require('./utility-functions.js');

//Mongo Models
const Guild = require('../../models/guild.js');
const User = require('../../models/user.js');
const StickerPack = require('../../models/sticker-pack.js');

//Add value to beginning of array, array max length is 3, only one of each value
function addToRecents(array, value){
	if(array.includes(value)){
		let index = array.indexOf(value);
		array.splice(index, 1);
	}
	array.unshift(value);
	return array.slice(0,3);
}

module.exports = function(message){

	let command = message.content.replace(/:/g, '');

	let documentArray = [
		User.findOneAndUpdate(
			{id: message.author.id},
			{
				id: message.author.id,
				username: message.author.username,
				avatarURL: message.author.avatarURL
			},
			{upsert: true,	new: true, setDefaultsOnInsert: true}
		)
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

		//Array of stickers available for command
		let stickers = docs[0].customStickers.map(sticker=>{
			sticker.name = `-${sticker.name}`;
			return sticker;
		});
		if(docs[1]){	
			stickers = stickers.concat(docs[1].customStickers);
		}

		//if message matches sticker
		if( stickers.map(s=>s.name).includes(command) ){

			//Send sticker
			let index = stickers.map(s=>s.name).indexOf(command);	
			message.channel.sendFile(
				stickers[index].url,
				`${command}.png`,
				`**${util.authorDisplayName(message)}:**`
			);
			//message.channel.sendMessage(stickers[index].url);

			//Add sticker to recents array
			if(docs[1] && command[0] != '-'){
				addToRecents(docs[1].recentStickers, command);
				docs[1].save();
			}

			//Delete message that was sent to trigger response
			if(message.channel.type == 'text'){
				message.delete()
				.catch(err=>{
					console.log(`Unable to delete message on guild: ${docs[1].id}`);
				});
			}

		}

	}).catch(err => util.handleError(err, message));

}