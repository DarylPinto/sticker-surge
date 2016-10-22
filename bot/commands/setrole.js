const base62 = require('base62');
const util = require('../assets/utility-functions.js');
const replies = require('../assets/replies.js');

module.exports = function(message, dbDocument){

	let messageWords = message.content.trim().split(' ');
	let maxRoleNameLength = 32;

	if(messageWords.length < 2){
		replies.use(message, 'invalidSetRoleSyntax', {'%%PREFIX%%': dbDocument.prefix});
		return false;
	}else if(/.*<:.+:\d+>.*/.test(messageWords[1]) || util.stringHasEmoji(messageWords[1])){
		replies.use(message, 'invalidSetRoleHasEmoji', {'%%PREFIX%%': dbDocument.prefix});
		return false;
	}else if(messageWords[1] == dbDocument.managerRole){
		replies.use(message, 'setRoleIdentical', {'%%ROLENAME%%': dbDocument.managerRole});
		return false;
	}else if(messageWords[1].length > maxRoleNameLength){
		replies.use(message, 'setRoleTooLong', {'%%MAXLENGTH%%': maxRoleNameLength});
		return false;
	}else{

		//If role is set to 'everyone', change it to '@everyone'
		let newRole = (messageWords[1].toLowerCase() === 'everyone') ? '@everyone' : messageWords[1].toLowerCase();
		dbDocument.managerRole = newRole;

		dbDocument.save()
		.then(() => {

			if(newRole === '@everyone'){
				replies.use(message, 'setRoleEveryone');	
			}else{
				replies.use(message, 'setRole', {'%%NEWROLE%%': newRole});		
			}

		}).catch(err => util.handleError(err, message));

	}
}