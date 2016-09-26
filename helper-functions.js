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
* @param {string} url Image URL
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

module.exports.msgHasImgAttached = msgHasImgAttached;
module.exports.linkIsDirectImg = linkIsDirectImg;
module.exports.msgHasRole = msgHasRole;