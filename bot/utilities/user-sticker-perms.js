module.exports = function({
	userId = null,
	guildManagerIds = [],
	stickerManagerIds = [],
	listMode = null,
	whitelistRole = null,
	whitelistIds = [],
	blacklistIds = []
} = {}){

	//Default perms 
	let	canManage = false;
	let canSend = true;
	
	if(guildManagerIds.includes(userId)){
		canManage = true;
		canSend = true;
	}else if(listMode === 'blacklist' && blacklistIds.includes(userId)){
		canManage = false;
		canSend = false;
	}else if(listMode === 'whitelist'){
		if(whitelistRole === '@everyone' || whitelistIds.includes(userId) || stickerManagerIds.includes(userId)){
			canManage = true;
			canSend = true;
		}else if(whitelistRole != '@everyone' && !whitelistIds.includes(userId)){
			canManage = false;
			canSend = false;
		}
	}

	return {canManage, canSend};
}
