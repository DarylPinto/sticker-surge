const rp = require('request-promise');
const covert = require('../../covert.js');

module.exports = function(message){

	let command = message.content.toLowerCase().replace(/:/g, '');
	let user = message.author;
	let is_guild_message = message.channel.type === 'text';
	let author_name = message.author.username;

	if(is_guild_message && message.member.nickname) author_name = message.member.nickname;

	//User stickers start with -
	if(command.startsWith('-')){
		let sticker_name = command.replace('-', '');

		rp({uri: `${covert.app_url}/api/users/${user.id}/stickers`, json: true})
		.then(res => {

			let sticker = res.find(s => s.name === sticker_name);	
			if(sticker){
				message.channel.send(`**${author_name}:**`, {files: [sticker.url]});
				message.delete();
			}

		})
		.catch(err => console.error);
	}

	//Guild stickers have no -
	else if(!command.includes('-') && is_guild_message){
		let guild = message.channel.guild;
		let sticker_name = command;

		rp({uri: `${covert.app_url}/api/guilds/${guild.id}/stickers`, json: true})
		.then(res => {

			let sticker = res.find(s => s.name === sticker_name);
			if(sticker){
				message.channel.send(`**${author_name}:**`, {files: [sticker.url]});
				message.delete();
			}

		})
		.catch(err => console.error);
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
				message.channel.send(`**${author_name}:**`, {files: [sticker.url]});
				message.delete();
			}

		})
		.catch(err => console.error);

	}

}