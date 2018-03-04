const Discord = require('discord.js');
const rp = require('request-promise');
const covert = require('../../covert.js');

module.exports = function(message, bot_auth){

	let command = message.content.toLowerCase().replace(/:/g, '');
	let user = message.author;
	let is_guild_message = message.channel.type === 'text';
	let author_name = message.author.username;

	if(is_guild_message && message.member.nickname) author_name = message.member.nickname;

	function useSticker(sticker, isPersonal){
		if(message.channel.type === 'text') message.delete();

		return message.channel.send(`**${author_name}:**`, {
			files: [{
				attachment: sticker.url,
				name: sticker.name+'.png'
			}]
		});

	}

	function handleSendStickerError(err){
		if(err.statusCode) err.status = err.statusCode;
		if(err.status === 404) return;
		console.error(`
			Guild: ${message.guild.id}
			Message: ${message.content}
			Error Code: ${err.code}
			Error Message: ${err.message}
		`.replace(/\t+/g, ''));
	}

	//User stickers start with -
	if(command.startsWith('-')){
		let sticker_name = encodeURIComponent(command.replace('-', ''));

		rp({
			method: 'POST',
			uri: `${covert.app_url}/api/users/${user.id}/stickers/${sticker_name}/uses`,
			json: true,
			headers: {Authorization: bot_auth}
		})
		.then(res => useSticker(res, true))
		.catch(err => handleSendStickerError(err));
	}

	//Guild stickers have no -
	else if(!command.includes('-') && is_guild_message){
		let guild = message.channel.guild;
		let sticker_name = encodeURIComponent(command);

		rp({
			method: 'POST',
			uri: `${covert.app_url}/api/guilds/${guild.id}/stickers/${sticker_name}/uses`,
			json: true,
			headers: {Authorization: bot_auth}
		})
		.then(res => useSticker(res, false))
		.catch(err => handleSendStickerError(err));
	}

	//Sticker packs seperate their pack key and name with a -
	else{

		//Must be re-written from scratch

	}

}