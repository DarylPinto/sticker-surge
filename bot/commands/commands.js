const rp = require('request-promise');
const userStickerPerms = require('../utilities/user-sticker-perms.js');

module.exports = function(message, prefix, guild_info){

	const embed_color = 16540258;

	if(message.channel.type === 'text'){

		const is_guild_manager = guild_info.guildManagerIds.includes(message.author.id);
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

		const escaped_prefix = prefix.replace(/[^a-zA-Zа-яёА-ЯЁ0-9]/g, '\\$&');
		const custom_sticker_creator_ids = guild_info.customStickers.map(s => s.creatorId);

		const help_message = (is_guild_manager) ? "Here is a list of commands:" : "Here is a list of commands you have permission to use:";

		let command_list = {
			color: embed_color,
			fields: [
				{
					name: `${escaped_prefix}stickers`,
					value: 'View this server\'s stickers.'
				}
			]
		}

		if(user_perms.canManage){
			command_list.fields.push(...[
				{
					name: `${escaped_prefix}addPack`,
					value: `Add a sticker pack for anyone on this server to use. [View all available packs](${process.env.APP_URL}/sticker-packs)`
				},
				{
					name: `${escaped_prefix}removePack`,
					value: `Remove a sticker pack from this server.`
				},
				{
					name: `${escaped_prefix}createSticker`,
					value: 'Create a custom sticker for anyone on this server to use.'
				}
			]);
		}

		//delete sticker is listed twice, Note the difference in verbiage ("one of your stickers" for regular users and
		//"a sticker" for guild managers - implying they can delete any sticker)
		if(!is_guild_manager && (user_perms.canManage || custom_sticker_creator_ids.includes(message.author.id))){
			command_list.fields.push({
				name: `${escaped_prefix}deleteSticker`,
				value: 'Delete one of the custom stickers that you\'ve created for this server.'
			});
		}

		if(is_guild_manager){
			command_list.fields.push(...[
				{
					name: `${escaped_prefix}deleteSticker`,
					value: 'Delete a custom sticker from this server.'
				},
				{
					name: `${escaped_prefix}whitelist`,
					value: 'Set the role required to use stickers on this server.'
				},
				{
					name: `${escaped_prefix}blacklist`,
					value: 'Set a role to be blocked from using stickers on this server.'
				},
				{
					name: `${escaped_prefix}togglePersonalStickers`,
					value: 'Toggle the ability to use personal stickers on this server.'
				},
				{
					name: `${escaped_prefix}setPrefix`,
					value: 'Set the prefix used to invoke these commands.'
				},
				{
					name: `${escaped_prefix}setManagerRole`,
					value: 'Set the role required to create stickers and manage sticker packs on this server.'
				}
			]);	
		}

		command_list.fields.push(...[
			{
				name: `${escaped_prefix}commands`,
				value: 'List commands.'
			},
			{
				name: `${escaped_prefix}help`,
				value: 'Get help and general info.'
			}
		]);	

		message.channel.send(`${help_message} ${process.env.APP_URL}/docs#commands`, {reply: message.author.id, embed: command_list});

	}else{
		
		message.channel.send({embed: {
			color: embed_color,
			fields: [
				{
					name: "stickers",
					value: "View your personal stickers."
				},
				{
					name: "addPack",
					value: `Add a sticker pack to your personal collection. You can use these on any server with Sticker Surge.\n[View all available packs](${process.env.APP_URL}/sticker-packs)`
				},
				{
					name: "removePack",
					value: `Remove a sticker pack from your personal collection.`
				},
				{
					name: "createSticker",
					value: "Create a custom sticker to use on any server with Sticker Surge."
				},
				{
					name: "deleteSticker",
					value: "Delete one of your custom stickers."
				},
				{
					name: "commands",
					value: "List commands."
				},
				{
					name: "help",
					value: "Get help and general info"
				}
			]
		}});

	}
	
}