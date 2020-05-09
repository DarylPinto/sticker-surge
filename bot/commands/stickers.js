module.exports = function(message){

	if(message.channel.type === 'text'){
		message.channel.send(`To see this server's stickers, click here: <${process.env.APP_URL}/server/${message.channel.guild.id}>`);
	}else{
		message.channel.send(`To see your personal stickers, click here: <${process.env.APP_URL}/user/${message.author.id}>`);	
	}
	
}