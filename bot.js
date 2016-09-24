const Discord = require('discord.js');
const token = require('./token.json');
const client = new Discord.Client();

client.on('ready', () => {
  console.log('I am ready!');
  //console.log(client.guilds);
});

client.on('message', message => {
  if( message.content.startsWith('+sticker') ) {
		message.reply(message.guild);
  //	addSticker(message);
  }
});

function addSticker(message){
	let argsArr = message.content.split(' ');
	if(argsArr.length < 3){
		message.channel.sendMessage('Invalid syntax. Use: `+sticker <NAME> <IMAGE URL>`');
	}else{
		message.channel.sendMessage('`:'+argsArr[1]+':` created.\nAnyone on the server can use this sticker.');
	}
}

client.login(token.value);