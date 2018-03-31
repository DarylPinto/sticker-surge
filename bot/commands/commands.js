const rp = require('request-promise');

module.exports = function(message, prefix, custom_stickers, sticker_manager_role, guild_manager_ids){

	const embed_color = 16540258;

	if(message.channel.type === 'text'){

		let is_sticker_manager = message.member.roles.map(r => r.id).includes(sticker_manager_role) || sticker_manager_role === '@everyone';
		let is_guild_manager = guild_manager_ids.includes(message.author.id);
		const escaped_prefix = prefix.replace(/[^a-zA-Zа-яёА-ЯЁ0-9]/g, '\\$&');
		const custom_sticker_creator_ids = custom_stickers.map(s => s.creatorId);

		const help_message = (is_guild_manager) ? "Here is a list of commands" : "Here is a list of commands you have permission to use:";

		let command_list = {
			color: embed_color,
			fields: [
				{
					name: `${escaped_prefix}stickers`,
					value: 'View this server\'s stickers.'
				}
			]
		}

		if(is_sticker_manager || is_guild_manager){
			command_list.fields.push({
				name: `${escaped_prefix}createSticker`,
				value: 'Create a custom sticker for anyone on this server to use.'
			});
		}

		//delete sticker is listed twice, Note the difference in verbiage ("one of your stickers" for regular users and
		//"a sticker" for guild managers - implying they can delete any sticker)
		if(
			(!is_guild_manager && is_sticker_manager) ||
			!is_guild_manager && custom_sticker_creator_ids.includes(message.author.id)
		){
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
					name: `${escaped_prefix}setPrefix`,
					value: 'Set the prefix used to invoke these commands.'
				},
				{
					name: `${escaped_prefix}setRole`,
					value: 'Set the role required to create stickers on this server.'
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

		message.channel.send(help_message, {reply: message.author.id, embed: command_list});

	}else{
		
		message.channel.send({embed: {
			color: embed_color,
			fields: [
				{
					name: "stickers",
					value: "View your personal stickers."
				},
				{
					name: "createSticker",
					value: "Create a custom sticker to use on any server with Stickers for Discord."
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