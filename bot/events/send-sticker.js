const rp = require('request-promise');
const userStickerPerms = require('../utilities/user-sticker-perms.js');
const updateWebhookChannel = require('../utilities/update-webhook-channel.js');
const covert = require('../../covert.js');

module.exports = async function(message, client, bot_auth){

	let command = message.content.toLowerCase().replace(/(:|;)/g, '');
	let user = message.author;
	let is_guild_message = message.channel.type === 'text';	
	let author_name = message.author.username;

	if(is_guild_message && message.member && message.member.nickname) author_name = message.member.nickname;

	//Returns Webhook used to send stickers
	async function getStickerWebhook(channel){
		const hooks = await channel.guild.fetchWebhooks();
		let hook = hooks.find(hook => {
			//Checking if hook.owner is undefined is necessary
			//for some (old?) webhooks, as they don't have that property.
			if(!hook.owner) return false;
			return hook.owner.id === client.user.id;
		});
		if(hook) return hook;	
		return await channel.createWebhook("Stickers", client.user.displayAvatarURL);
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

	// Adds a `size` querystring to the end of an avatarURL
	function resizeAvatarURL(avatarURL, size) {
		let baseURL = (avatarURL.includes('?')) ?
			avatarURL.substr(0, avatarURL.indexOf('?')) :
			avatarURL;

		return `${baseURL}?size=${size}`;
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
					stickerManagerRole: guild_info.stickerManagers.roleId,
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

				if(!guild_info.personalStickersAllowed && sticker.groupType === 'user'){
					message.channel.send('Personal stickers are not allowed on this server.');
					return false;
				}

				//Delete original message
				if(message.channel.memberPermissions(client.user).has('MANAGE_MESSAGES')) message.delete();

				//Webhook style sticker
				if(message.channel.memberPermissions(client.user).has('MANAGE_WEBHOOKS')){
					let hook = await getStickerWebhook(message.channel);
					//Discord requires webhook names to be 2 chars minimum.
					//Spread operator below provides more accurate char count for usernames that can potentially include emojis	
					//stackoverflow.com/a/37535876
					let name = ([...author_name].length > 1) ? author_name : author_name + '.';
						
					//Update webhook channel
					if(hook.channelID !== message.channel.id){
						try {
							await updateWebhookChannel(hook.id, message.channel.id);
						}catch(err){
							return message.channel.send(
								`**Error:**
								Sticker webhook is stuck in a different channel.
								Make sure this bot has permission to manage webhooks in EVERY channel.	

								*(Channel settings > Permissions > Sticker Surge > Manage Webhooks)*`.replace(/\t/g, '')
							);
						}
					}

					message_options.username = name;
					message_options.avatarURL = resizeAvatarURL(user.displayAvatarURL, 64);
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
			====

			${is_guild_message ? "Guild" : "User"}: ${is_guild_message ? message.guild.id : user.id}
			Message: ${message.content}
			Time: ${(new Date().toLocaleString('en-US', {timezone: 'EST'}))}
			Error Code: ${err.code ? err.code : 'N/A'}
			Error Message: ${err.message}
			Error Stack: ${(err.stack.length > 300) ? err.stack.substr(0, 300) + '...\ntruncated after 300 characters' : err.stack}

			====
		`.replace(/\t+/g, ''));	
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
