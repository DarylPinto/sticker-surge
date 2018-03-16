const rp = require('request-promise');

module.exports = function(message, prefix, sticker_amount, sticker_manager_role, guild_manager_ids){

	const embed_color = 16540258;
	const lib_version = "11.2.1";
	const discord_link = "https://discord.gg/HNFmKsE";
	const add_bot_link = "https://discordapp.com/oauth2/authorize?client_id=224415693393625088&scope=bot&permissions=536879104";
	const bot_vote_link = "https://discordbots.org/bot/224415693393625088/vote";

	//Escape prefix to avoid issues with Discord formatting
	const escaped_prefix = (prefix) ? prefix.replace(/[^a-zA-Z0-9]/g, '\\$&') : null;	

	if(message.channel.type === 'text'){

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
						Required Role: ${sticker_manager_role === '@everyone' ? 'everyone' : sticker_manager_role}
						Custom Stickers: ${sticker_amount}
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
					name: "Useful Links",
					value: `
						[View Your Personal Stickers](https://stickersfordiscord.com/user/${message.author.id})
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