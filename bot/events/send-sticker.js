const Discord = require('discord.js');
const rp = require('request-promise');
const userStickerPerms = require('../utilities/user-sticker-perms.js');
const covert = require('../../covert.js');

module.exports = async function(message, bot_auth){

	let command = message.content.toLowerCase().replace(/(:|;)/g, '');
	let user = message.author;
	let is_guild_message = message.channel.type === 'text';	
	let author_name = message.author.username;

	if(is_guild_message && message.member.nickname) author_name = message.member.nickname;

	function incrementStickerUses(sticker_name, sticker_type, group_id){
		rp({
			method: 'POST',
			uri: `${covert.app_url}/api/${sticker_type}/${group_id}/stickers/${sticker_name}/uses`,
			json: true,
			headers: {Authorization: bot_auth}
		})
		.catch(err => handleSendStickerError(err));
	}

	//Attempt to use sticker. Returns true if sticker was succesfully sent, and false if not.
	async function useSticker(sticker, pack_key){

		//Ensure user has proper permissions to send a sticker
		if(is_guild_message){
			let user_perms;
			const guild_and_user_info = await Promise.all([
				rp({
					method: 'GET',
					uri: `${covert.app_url}/api/guilds/${message.channel.guild.id}/info`,
					json: true
				}),
				rp({
					method: 'GET',
					uri: `${covert.app_url}/api/users/${user.id}/info`,
					json: true
				})
			]);

			const guild_info = guild_and_user_info[0];
			const user_info = guild_and_user_info[1];

			//Don't send sticker if guild AND message author aren't subscribed to pack
			if(pack_key && !guild_info.stickerPacks.includes(pack_key) && !user_info.stickerPacks.includes(pack_key)){
				return false;
			}

			user_perms = userStickerPerms({
				userId: message.author.id,
				guildManagerIds: guild_info.guildManagerIds,
				stickerManagerIds: guild_info.stickerManagers.userIds,
				listMode: guild_info.listMode,
				whitelistRole: guild_info.whitelist.roleId,
				whitelistIds: guild_info.whitelist.userIds,
				blacklistIds: guild_info.blacklist.userIds
			});

			if(!user_perms.canSend){
				message.channel.send('You do not have permission to send stickers on this server.');
				return false;
			}
		}	

		//Respond with sticker
		let message_options = {
			files: [{
				attachment: sticker.url,
				name: sticker.name+'.png'
			}]
		}

		try{

			//Guild messages
			if(is_guild_message){

				//Delete original message
				if(message.channel.guild.me.hasPermission('MANAGE_MESSAGES')) message.delete();

				//Webhook style sticker
				if(message.channel.guild.me.hasPermission('MANAGE_WEBHOOKS')){
					let avatar = message.author.displayAvatarURL;
					let hook = await message.channel.createWebhook(author_name, avatar);
					await hook.send(message_options);
					hook.delete();
					return true;
				}
				//Classic style sticker
				else{
					message.channel.send(`**${author_name}:**`, message_options);
					return true;
				}
			}

			//User messages/DMs
			else{
				const user_info = await rp({
					method: 'GET',
					uri: `${covert.app_url}/api/users/${user.id}/info`,
					json: true
				});

				//Don't send sticker if user isn't subscribed to pack
				if(pack_key && !user_info.stickerPacks.includes(pack_key)){
					return false;
				}

				message.channel.send(`**${author_name}:**`, message_options);
				return true;
			}

		}catch(err){
			handleSendStickerError(err);
		}

	}

	function handleSendStickerError(err){
		if(err.statusCode) err.status = err.statusCode;
		if(err.status === 404) return;
		console.error(`
			${is_guild_message ? "Guild" : "User"}: ${is_guild_message ? message.guild.id : user.id}
			Message: ${message.content}
			Error Code: ${err.code}
			Error Message: ${err.message}
		`.replace(/\t+/g, ''));
	}

	//User stickers start with -
	if(command.startsWith('-')){
		let sticker_name = encodeURIComponent(command.replace('-', ''));

		rp({
			method: 'GET',
			uri: `${covert.app_url}/api/users/${user.id}/stickers/${sticker_name}`,
			json: true
		})
		.then(res => useSticker(res))
		.then(stickerWasUsed => {
			if(stickerWasUsed) incrementStickerUses(sticker_name, 'users', user.id);
		})
		.catch(err => handleSendStickerError(err));
	}

	//Guild stickers have no -
	else if(!command.includes('-') && is_guild_message){
		let guild = message.channel.guild;
		let sticker_name = encodeURIComponent(command);

		rp({
			method: 'GET',
			uri: `${covert.app_url}/api/guilds/${guild.id}/stickers/${sticker_name}`,
			json: true
		})
		.then(res => useSticker(res))
		.then(stickerWasUsed => {
			if(stickerWasUsed) incrementStickerUses(sticker_name, 'guilds', guild.id);
		})
		.catch(err => handleSendStickerError(err));
	}

	//Sticker packs seperate their pack key and name with a -
	else{
		let pack_key = command.split('-')[0];
		let sticker_name = command.split('-')[1];

		rp({
			method: 'GET',
			uri: `${covert.app_url}/api/sticker-packs/${pack_key}/stickers/${sticker_name}`,
			json: true
		})
		.then(res => useSticker(res, pack_key))
		.then(stickerWasUsed => {
			if(stickerWasUsed) incrementStickerUses(sticker_name, 'sticker-packs', pack_key);
		})
		.catch(err => handleSendStickerError(err));
	}

}
