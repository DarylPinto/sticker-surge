const rp = require('request-promise');

module.exports = function(message, prefix){

	if(message.channel.type === 'text'){

		message.channel.send(`

\`${prefix}stickers\`: View this server's stickers.
\`${prefix}createsticker\`: Create a custom sticker for anyone on this server to use.
\`${prefix}deletesticker\`: Delete a custom sticker from this server.
\`${prefix}setprefix\`: Set the prefix used to trigger these commands.
\`${prefix}setrole\`: Set the role required to modify stickers on this server.
\`${prefix}help\`: List commands.

		`);

	}else{
		
		message.channel.send(`

\`stickers\`: View your personal stickers.
\`createsticker\`: Create a custom sticker to use on any server that has Stickers for Discord.
\`deletesticker\`: Delete one of your custom stickers.
\`help\`: List commands.

		`);

	}
	
}