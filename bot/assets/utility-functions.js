/**
* Does message have an image attachment?
*
* @param {message object} message
* @returns {boolean}
*/
function msgHasImgAttached(message){
	if(message.attachments.array()[0] == undefined ||
	   message.attachments.array()[0].height == undefined){
		return false;
	}else{
		return true;
	}
}

/**
* Is this link a direct link to a .jpeg or .png?
*
* @param {string} url - Image URL
* @returns {boolean}
*/
function linkIsDirectImg(url){
	let regex = new RegExp('(https?:\/\/.*\.(?:png|jpg|jpeg))', 'i');
	return regex.test(url);
}

/**
* Get display name of messge author.
*
* @param {message object} message
* @returns {string}
*/
function authorDisplayName(message){
	if(message.channel.type == 'text' && message.member.nickname != null){
		return message.member.nickname;
	}
	return message.author.username;
}

/**
* Does the author of this message have the role `roleName` (lowercase only)?
* 
* @param {message object} message
* @param {string} roleName 
* @returns {boolean}
*/
function msgHasRole(message, roleName){
	return message.member.roles.map(r=>r.name.toLowerCase()).includes(roleName);
}

/**
* Get prefixless command string if message has valid command, or null if it doesn't
*
* @param {string} prefix - prefix for bot commands
* @param {message obj} message - message to check for command
* @returns {string|null} - prefixless string if command is valid, or null if it isn't
*/
function getCommand(prefix, message){
	 //Get first word of message
	let command = message.content.toLowerCase().split(' ')[0];
	//set command to prefixless command, or to null if it doesn't begin with prefix
	command = (message.content.substr(0, prefix.length) === prefix) ? command.substr(prefix.length) : null;
	return command;
}

/**
* Replace multiple susbtrings within a string
* From stackoverflow.com/q/16576983
*
* @param {string} str - base string 
* @param {object} obj - map of substrings and their replacements
* @returns {string} - string with replacements made 
*/
function multiReplace(str, obj) {
	var retStr = str;
	for (var x in obj) {
		retStr = retStr.replace(new RegExp(x, 'g'), obj[x]);
	}
	return retStr;
};

/**
* Does string contain an emoji?
*
* @param {string} str - string to check
* @returns {boolean}
*/
function stringHasEmoji(str){
	let hasEmoji = false;
	for(let i = 0;i < str.length;i++){
		if(str.charCodeAt(i) >= 55357) hasEmoji = true;
	}
	return hasEmoji;
}

/**
* Handle an error (usually db connection problem)
*
* @param {error} err - Error to handle
* @param {message} message - Message to reply to incase of an error
*/
function handleError(err, message){	
	message = message || null;
	if(message)	message.channel.sendMessage("An unknown error occured.");
	console.log(err);

	//stop bot if it can't connect to db (it's useless otherwise)
	process.exit();
}

module.exports = {
	msgHasImgAttached,
	linkIsDirectImg,
	authorDisplayName,
	msgHasRole,
	getCommand,
	multiReplace,
	stringHasEmoji,
	handleError
}