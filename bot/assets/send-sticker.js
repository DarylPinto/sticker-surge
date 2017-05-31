const rp = require('request-promise');

module.exports = function(message){

	let user_id = message.author.id;
	let sticker_name;

	if(message.content.includes('-')){
		sticker_name = message.content.replace(/:/g, '').split('-')[1];
	}else{
		sticker_name = message.content.replace(/:/g, '');
	}

	rp(`http://localhost:3000/api/users/${user_id}/stickers`)
	.then(res => {	
		let sticker = JSON.parse(res).find(s => s.name === sticker_name);

		if(sticker){
			message.channel.send(`**${message.author.username}:**`, {files: [sticker.url]});
		}
	})
	.catch(err => console.error);

}