const rp = require('request-promise');

module.exports = function(message, prefix, sticker_amount, sticker_manager_role, guild_manager_ids){

	if(message.channel.type === 'text'){

		message.channel.send({embed: {
			color: 16540258,
			//title: "Stickers for Discord",
			description: `
				**Stickers for Discord**
				To view a list of commands, type \`${prefix}commands\`

				**Server Info**
				Stickers: https://stickersfordiscord.com/server/${message.guild.id}	
				Prefix: \`${prefix}\`
				Required Role: ${sticker_manager_role === '@everyone' ? 'N/A' : sticker_manager_role}
				Custom Stickers: ${sticker_amount}/400
				
				**Bot Info**
				Library: Discord.js 11.2.1
				Created by: DRL#1287
				Add to another server: https://goo.gl/WFPwcD
				Join our Discord: https://discord.gg/HNFmKsE
				Help us out by voting: https://goo.gl/TxNZd2
			`.replace(/\t/g, '')
		}});

	}else{

	}
	
}