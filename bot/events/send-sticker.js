const rp = require('request-promise');
const covert = require('../../covert.js');

module.exports = function(message){

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

		rp({uri: `${covert.app_url}/api/users/${user.id}/stickers/${sticker_name}`, json: true})
		.then(res => useSticker(res))
		.catch(err => (err.statusCode != 404) ? console.error(err.message) : null);
	}

	//Guild stickers have no -
	else if(!command.includes('-') && is_guild_message){
		let guild = message.channel.guild;
		let sticker_name = command;

		rp({uri: `${covert.app_url}/api/guilds/${guild.id}/stickers/${sticker_name}`, json: true})
		.then(res => useSticker(res))
		.catch(err => (err.statusCode != 404) ? console.error(err.message) : null);
	}

	//Sticker packs seperate their pack key and name with a -
	else{

		let pack_key = command.split('-')[0];
		let sticker_name = command.split('-')[1];
		let requests = [rp({uri: `${covert.app_url}/api/users/${user.id}`, json: true})];

		//If guild message
		if(is_guild_message){
			let guild = message.channel.guild;
			requests.push(rp({uri: `${covert.app_url}/api/guilds/${guild.id}`, json: true}));
		}

		Promise.all(requests)
		.then(res => {

			let valid_packs =  res[0].stickerPacks;
			if(res[1]) valid_packs = valid_packs.concat(res[1].stickerPacks);

			if(!valid_packs.includes(pack_key)) return null;

			return rp({uri: `${covert.app_url}/api/packs/${pack_key}`, json: true});

		})
		.then(res => {
			if(!res|| res.status === 404) return null;

			let sticker = res.stickers.find(s => s.name === sticker_name);
			if(sticker){
				if(message.channel.type === 'text') message.delete();
				message.channel.send(`**${author_name}:**`, {files: [sticker.url]});
			}

		})
		.catch(err => console.error);

	}

}