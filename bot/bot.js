const Discord = require('discord.js');
const rp = require('request-promise');
const client = new Discord.Client();
const covert = require('../covert.js');

//Assets
const sendSticker = require('./assets/send-sticker.js');

client.on('ready', () => {
	console.log('Discord Stickers bot is online!');
});

client.on('guildCreate', guild => {
	
	rp({
		method: 'POST',
		uri: 'http://localhost:3000/api/guilds/',
		body: {
			id: guild.id,
			guildName: guild.name,	
			icon: guild.icon || ''
		}	
	})
	.then(res => {
		console.log(res);
	})
	.catch(err => console.error);

});

client.on('message', message => {
	
	////////////
	//Stickers//
	////////////
	if( /^:[a-zA-Z0-9-]+:$/.test(message.content.trim()) ){
		sendSticker(message);
		return false;
	}


});

client.login(covert.discord.bot_token);