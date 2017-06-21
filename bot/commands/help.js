const rp = require('request-promise');

module.exports = function(message, prefix, contentRole, managerRole){

	if(message.channel.type === 'text'){

		let has_content_role = message.member.roles.array().map(r => r.name.toLowerCase()).includes(contentRole.toLowerCase());
		let has_manager_role = message.member.roles.array().map(r => r.name.toLowerCase()).includes(managerRole.toLowerCase());

		let helpinfo = prefix+'stickers       : View this server\'s stickers.\n';

		if(has_content_role || has_manager_role){
			helpinfo  += prefix+'createSticker  : Create a custom sticker for anyone on this server to use.\n';
			helpinfo  += prefix+'deleteSticker  : Delete a custom sticker from this server.\n';	
		}

		if(has_manager_role){
			helpinfo  += prefix+'setPrefix      : Set the prefix used to trigger these commands.\n';
			helpinfo  += prefix+'setContentRole : Set the role required to create/delete stickers on this server.\n';
			helpinfo  += prefix+'setManagerRole : Set the role required to manage everything to do with this bot.\n';
		}

		helpinfo    += prefix+'info           : View information about Stickers for Discord on this server.\n';
		helpinfo    += prefix+'help           : List commands.';

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