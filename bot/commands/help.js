const rp = require('request-promise');

module.exports = function(message, prefix, contentRole, managerRole){

	if(message.channel.type === 'text'){

		let reply = \`${prefix}stickers\` - View this server's stickers.\n`;

		if(message.member.roles.array().map(r => r.name.toLowerCase()).includes(contentRole.toLowerCase())){
			reply += `\`${prefix}createSticker\` - Create a custom sticker for anyone on this server to use.\n`;
			reply += `\`${prefix}deleteSticker\` - Delete a custom sticker from this server.\n`;	
		}

		if(message.member.roles.array().map(r => r.name.toLowerCase()).includes(managerRole.toLowerCase())){
			reply += `\`${prefix}setPrefix\` - Set the prefix used to trigger these commands.\n`;
			reply += `\`${prefix}setContentRole\` - Set the role required to create/delete stickers on this server.\n`;
			reply += `\`${prefix}setManagerRole\` - Set the role required to manage this bot.\n`;
		}

		reply += `\`${prefix}help\` - List commands.`;

		message.channel.send(reply);

	}else{
		
		message.channel.send(`

\`stickers\`: View your personal stickers.
\`createsticker\`: Create a custom sticker to use on any server that has Stickers for Discord.
\`deletesticker\`: Delete one of your custom stickers.
\`help\`: List commands.

		`);

	}
	
}