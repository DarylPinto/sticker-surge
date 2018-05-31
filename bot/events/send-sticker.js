const rp = require('request-promise');
const userStickerPerms = require('../utilities/user-sticker-perms.js');
const editWebhook = require('../utilities/edit-webhook.js');
const covert = require('../../covert.js');

module.exports = async function(message, client, bot_auth){

	let command = message.content.toLowerCase().replace(/(:|;)/g, '');
	let user = message.author;
	let is_guild_message = message.channel.type === 'text';	
	let author_name = message.author.username;

	if(is_guild_message && message.member.nickname) author_name = message.member.nickname;

	//Returns Webhook used to send stickers
	async function getStickerWebhook(channel){
		const hooks = await channel.guild.fetchWebhooks();
		let hook = hooks.find(hook => hook.owner.id === client.user.id);
		if(hook) return hook;
		return await channel.createWebhook("Stickers for Discord");
	}

	//Increment `uses` property on sticker
	function incrementStickerUses(sticker_name, sticker_type, group_id){
		rp({
			method: 'POST',
			uri: `${covert.app_url}/api/${sticker_type}/${group_id}/stickers/${sticker_name}/uses`,
			json: true,
			headers: {Authorization: bot_auth}
		})
		.catch(err => handleSendStickerError(err));
	}

	//Returns an array of pack keys that a user is subscribed to
	async function getUsersStickerPacks(userId){
		try{
			let user = await rp({
				method: 'GET',
				uri: `${covert.app_url}/api/users/${userId}/info`,
				json: true
			});
			return user.stickerPacks;
		}catch(err){	
			//Return empty array if user is not in DB (and therefore isn't subscribed to any packs)
			return [];	
		}
	}

	//Attempt to use sticker. Returns true if sticker was succesfully sent, and false if not.
	async function useSticker(sticker, pack_key){

		//Prepare sticker message content
		let message_options = {
			files: [{
				attachment: sticker.url,
				name: sticker.name+'.png'
			}]
		}

		try{
			//Ensure user has proper permissions to send a sticker
			if(is_guild_message){
				
				const guild_info = await rp({
					method: 'GET',
					uri: `${covert.app_url}/api/guilds/${message.guild.id}/info`,
					json: true
				});

				const guild_packs = guild_info.stickerPacks;
				const user_packs = await getUsersStickerPacks(user.id);

				//Don't send sticker if guild AND message author aren't subscribed to pack
				if(pack_key && !guild_packs.includes(pack_key) && !user_packs.includes(pack_key)) return false;

				const user_perms = userStickerPerms({
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

				//Delete original message
				if(message.guild.me.hasPermission('MANAGE_MESSAGES')) message.delete();

				//Webhook style sticker
				if(message.guild.me.hasPermission('MANAGE_WEBHOOKS')){
					let name = (author_name.length > 1) ? author_name : author_name + '.'; //Discord requires webhook names to be 2 chars minimum
					let avatar = message.author.displayAvatarURL;
					let channel_id = message.channel.id;
					let hook = await getStickerWebhook(message.channel);	
	
					//Update webhook only when user or channel has changed
					if(hook.name !== name || hook.channelID !== channel_id){
						hook = await editWebhook(client, {
							bot_token: covert.discord.bot_token,
							hook_id: hook.id,
							body: {name, avatar, channel_id}
						});	
					}

					await hook.send(message_options);
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
				const user_packs = await getUsersStickerPacks(user.id);

				//Don't send sticker if user isn't subscribed to pack
				if(pack_key && !user_packs.includes(pack_key)) return false;

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
		//throw err;
	}

	//User stickers start with -
	if(command.startsWith('-')){
		let sticker_name = encodeURIComponent(command.replace('-', ''));
		if(sticker_name.length === 0) return;

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
		let guild = message.guild;
		let sticker_name = encodeURIComponent(command);
		if(sticker_name.length === 0) return;

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
		if(sticker_name.length === 0) return;

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
