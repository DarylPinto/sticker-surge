const rp = require('request-promise');

module.exports = function(message, prefix, sticker_manager_role, guild_manager_ids){

	if(message.channel.type === 'text'){

		let is_sticker_manager = message.member.roles.map(r => r.name.toLowerCase()).includes(sticker_manager_role.toLowerCase());
		let is_guild_manager = guild_manager_ids.includes(message.author.id);

		let commandlist = prefix+'stickers      : View this server\'s stickers.\n';

		if(is_sticker_manager || is_guild_manager){
			commandlist  += prefix+'createSticker : Create a custom sticker for anyone on this server to use.\n';	
		}

		//delete sticker is listed twice, Note the difference in verbiage ("one of your stickers" for regular users and
		//"a sticker" for guild managers - implying they can delete any sticker)
		if(!is_guild_manager){
			commandlist  += prefix+'deleteSticker : Delete a custom sticker that you\'ve created for this server.\n';
		}

		if(is_guild_manager){
			commandlist  += prefix+'deleteSticker : Delete a custom sticker from this server.\n';
			commandlist  += prefix+'setPrefix     : Set the prefix used to trigger these commands.\n';
			commandlist  += prefix+'setRole       : Set the role required to create stickers on this server.\n';
		}

		commandlist    += prefix+'commands      : List commands.\n';
		commandlist    += prefix+'help          : Get help and general info.';

		message.channel.send(commandlist, {reply: message.author.id, code: true});

	}else{
		
		let commandlist = `
stickers      : View your personal stickers.
createSticker : Create a custom sticker to use on any server with Stickers for Discord.
deleteSticker : Delete one of your custom stickers.
commands      : List commands.
help          : Get help and general info.
`;

		message.channel.send(commandlist, {reply: message.author.id, code: true});

	}
	
}