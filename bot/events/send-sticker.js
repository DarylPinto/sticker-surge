const rp = require('request-promise');
const covert = require('../../covert.js');

module.exports = function(message, bot_auth){

	let command = message.content.toLowerCase().replace(/:/g, '');
	let user = message.author;
	let is_guild_message = message.channel.type === 'text';
	let author_name = message.author.username;

	if(is_guild_message && message.member.nickname) author_name = message.member.nickname;

	function useSticker(sticker){
		if(message.channel.type === 'text') message.delete();
		message.channel.send(`**${author_name}:**`, {
			files: [{
				attachment: sticker.url,
				name: sticker.name+'.png'
			}]
		});
	}

	//User stickers start with -
	if(command.startsWith('-')){
		let sticker_name = command.replace('-', '');

		rp({
			method: 'POST',
			uri: `${covert.app_url}/api/users/${user.id}/stickers/${sticker_name}/uses`,
			json: true,
			headers: {Authorization: bot_auth}
		})
		.then(res => useSticker(res))
		.catch(err => (err.statusCode != 404) ? console.error(err.message) : null);
	}

	//Guild stickers have no -
	else if(!command.includes('-') && is_guild_message){
		let guild = message.channel.guild;
		let sticker_name = command;

		rp({
			method: 'POST',
			uri: `${covert.app_url}/api/guilds/${guild.id}/stickers/${sticker_name}/uses`,
			json: true,
			headers: {Authorization: bot_auth}
		})
		.then(res => useSticker(res))
		.catch(err => (err.statusCode != 404) ? console.error(err.message) : null);
	}

	//Sticker packs seperate their pack key and name with a -
	else{

		//Must be re-written from scratch

	}

}