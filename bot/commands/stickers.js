const rp = require('request-promise');
const covert = require('../../covert.js');

module.exports = function(message){

	if(message.channel.type === 'text'){
		message.channel.send(`To see this server's stickers, click here: <${covert.app_url}/server/${message.channel.guild.id}>`);
	}else{
		message.channel.send(`To see your personal stickers, click here: <${covert.app_url}/user/${message.author.id}>`);	
	}
	
}