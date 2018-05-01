const rp = require('request-promise');

module.exports = function(message, prefix, guild_info){

	const embed_color = 16540258;
	const lib_version = "11.2.1";
	const discord_link = "https://discord.gg/HNFmKsE";
	const add_bot_link = "https://discordapp.com/oauth2/authorize?client_id=224415693393625088&scope=bot&permissions=536879104";
	const bot_vote_link = "https://discordbots.org/bot/224415693393625088";

	let sticker_manager_role = guild_info.stickerManagerRole;
	let custom_stickers = guild_info.customStickers;
	let list_mode = guild_info.listMode;
	let whitelist_role = guild_info.whitelistRole;
	let blacklist_role = guild_info.blacklistRole;
	let who_can_send;

	//Escape prefix to avoid issues with Discord formatting
	const escaped_prefix = (prefix) ? prefix.replace(/[^a-zA-Z0-9]/g, '\\$&') : null;
	const sticker_amount = custom_stickers.length;

	if(message.channel.type === 'text'){

		const guild = message.channel.guild;	
		let sticker_manager_role_name;

		const getRoleNameFromId = id => {
			if(id === '@everyone') return 'everyone';
			else if(id === null) return 'N/A';
			else{
				let role = guild.roles.find(r => r.id === id);
				return role.name.replace(/[^a-zA-Zа-яёА-ЯЁ0-9\s]/g, '\\$&');
			}
		}

		sticker_manager_role_name = getRoleNameFromId(sticker_manager_role);
		whitelist_role_name = getRoleNameFromId(whitelist_role);
		blacklist_role_name = getRoleNameFromId(blacklist_role);	

		if(list_mode === 'whitelist'){
			if(whitelist_role_name === 'everyone') who_can_send = 'everyone';
			else who_can_send = `Everyone __with__ the role *${whitelist_role_name}*`;
		}else{
			who_can_send = `Everyone __without__ the role *${blacklist_role_name}*`;
		}

		message.channel.send({embed: {
			color: embed_color,
			fields: [
				{
					name: "Stickers for Discord",
					value: `
						To view a list of commands, type: **${escaped_prefix}commands**
						.
					`.replace(/\t/g, '')
				},
				{
					name: message.guild.name,
					value: `
						Command Prefix: ${escaped_prefix}
						Sticker Manager Role: ${sticker_manager_role_name}
						Who can use stickers? ${who_can_send}
						Custom Sticker Count: ${sticker_amount}
						[View Stickers](https://stickersfordiscord.com/server/${message.guild.id})
						.
					`.replace(/\t/g, '')
				},
				{
					name: "Useful Links",
					value: `
						[Join our Discord](${discord_link})
						[Add bot to another server](${add_bot_link})
						[Enjoy the bot? Upvote it on DiscordBotList <3](${bot_vote_link})
						___
					`.replace(/\t/g, '')
				}
			],
			footer: {
				text: `Created by: DRL#1287 | Library: Discord.js ${lib_version}`
			}
		}});

	}else{

		message.channel.send({embed: {
			color: embed_color,
			fields: [
				{
					name: "Stickers for Discord",
					value: `
						To view a list of commands, type: **commands**
						.
					`.replace(/\t/g, '')
				},
				{
					name: message.author.username,
					value: `
						Custom Stickers: ${sticker_amount}
						[View Stickers](https://stickersfordiscord.com/user/${message.author.id})
						.
					`.replace(/\t/g, '')
				},
				{
					name: "Useful Links",
					value: `
						[Join our Discord](${discord_link})
						[Add bot to a server](${add_bot_link})
						[Enjoy the bot? Upvote it on DiscordBotList <3](${bot_vote_link})
						___
					`.replace(/\t/g, '')
				}
			],
			footer: {
				text: `Created by: DRL#1287 | Library: Discord.js ${lib_version}`
			}
		}});

	}
	
}