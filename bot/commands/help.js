const rp = require('request-promise');

module.exports = function(message, prefix, sticker_manager_role, guild_manager_ids){

	if(message.channel.type === 'text'){

		let is_sticker_manager = message.member.roles.map(r => r.name.toLowerCase()).includes(sticker_manager_role.toLowerCase());
		let is_guild_manager = guild_manager_ids.includes(message.author.id);

		let helpinfo = prefix+'stickers      : View this server\'s stickers.\n';

		if(is_sticker_manager || is_guild_manager){
			helpinfo  += prefix+'createSticker : Create a custom sticker for anyone on this server to use.\n';	
		}

		//delete sticker is listed twice, Note the difference in verbiage ("one of your stickers" for regular users and
		//"a sticker" for guild managers - implying they can delete any sticker)
		if(is_sticker_manager && !is_guild_manager){
			helpinfo  += prefix+'deleteSticker : Delete one of your custom stickers from this server.\n';
		}

		if(is_guild_manager){
			helpinfo  += prefix+'deleteSticker : Delete a custom sticker from this server.\n';
			helpinfo  += prefix+'setPrefix     : Set the prefix used to trigger these commands.\n';
			helpinfo  += prefix+'setRole       : Set the role required to create stickers on this server.\n';
			//helpinfo  += prefix+'setManagerRole : Set the role required to manage everything to do with this bot.\n';
		}

		//helpinfo    += prefix+'info          : View information about Stickers for Discord on this server.\n';
		helpinfo    += prefix+'help          : List commands.';

		message.channel.send(helpinfo, {reply: message.author.id, code: true});

	}else{
		
		let helpinfo = `
stickers      : View your personal stickers.
createSticker : Create a custom sticker to use on any server with Stickers for Discord.
deleteSticker : Delete one of your custom stickers.
help          : List commands.
`;

		message.channel.send(helpinfo, {reply: message.author.id, code: true});

	}
	
}