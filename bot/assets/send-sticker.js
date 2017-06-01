const rp = require('request-promise');

module.exports = function(message){

	let command = message.content.toLowerCase().replace(/:/g, '');
	let user = message.author;
	let is_guild_message = message.channel.type === 'text';
	let author_name = message.author.username;

	if(is_guild_message && message.member.nickname) author_name = message.member.nickname;

	//User stickers start with -
	if(command.startsWith('-')){
		let sticker_name = command.replace('-', '');

		rp(`http://localhost:3000/api/users/${user.id}/stickers`)
		.then(res => {

			let sticker = JSON.parse(res).find(s => s.name === sticker_name);	
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

		rp(`http://localhost:3000/api/guilds/${guild.id}/stickers`)
		.then(res => {

			let sticker = JSON.parse(res).find(s => s.name === sticker_name);
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
		let requests = [rp(`http://localhost:3000/api/users/${user.id}`)];

		//If guild message
		if(is_guild_message){
			let guild = message.channel.guild;
			requests.push(rp(`http://localhost:3000/api/guilds/${guild.id}`));
		}

		Promise.all(requests)
		.then(res => {

			res = res.map(r => JSON.parse(r));
			let valid_packs =  res[0].stickerPacks;
			if(res[1]) valid_packs = valid_packs.concat(res[1].stickerPacks);

			if(!valid_packs.includes(pack_key)) return null;

			return rp(`http://localhost:3000/api/packs/${pack_key}`);

		})
		.then(res => {
			if(!res|| res.status === 404) return null;

			let sticker = JSON.parse(res).stickers.find(s => s.name === sticker_name);
			if(sticker){
				message.channel.send(`**${author_name}:**`, {files: [sticker.url]});
				message.delete();
			}

		})
		.catch(err => console.error);

	}

}