const Discord = require('discord.js');
const client = new Discord.Client();
const covert = require('../covert.js');

//Assets
const sendSticker = require('./assets/send-sticker.js');

client.on('ready', () => {
	console.log('Discord Stickers bot is online!');
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