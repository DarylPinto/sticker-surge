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
* Does the author of this message have the role `roleName`?
*
* @param {message object} message
* @param {string} roleName 
* @returns {boolean}
*/
function msgHasRole(message, roleName){
	return message.member.roles.map(r=>r.name).includes(roleName);
}

/**
* Get prefixless command string if message has valid command, or null if it doesn't
*
* @param {string} prefix - prefix for bot commands
* @param {message obj} message - message to check for command
* @returns {string || null} - prefixless string if command is valid, or null if it isn't
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
multiReplace = function(str, obj) {
	var retStr = str;
	for (var x in obj) {
		retStr = retStr.replace(new RegExp(x, 'g'), obj[x]);
	}
	return retStr;
};

module.exports = {
	msgHasImgAttached,
	linkIsDirectImg,
	msgHasRole,
	getCommand,
	multiReplace
}