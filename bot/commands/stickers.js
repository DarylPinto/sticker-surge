const rp = require('request-promise');

module.exports = function(message){

	if(message.channel.type === 'text'){
		message.channel.send(`To see this server's stickers, click here: https://stickersfordiscord.com/server/${message.channel.guild.id}`);
	}else{
		message.channel.send(`To see all your stickers, click here: https://stickersfordiscord.com/user/${message.author.id}`);	
	}
	
}