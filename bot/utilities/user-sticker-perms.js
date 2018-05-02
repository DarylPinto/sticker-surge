module.exports = function(userId, guildManagerIds, stickerManagerIds, listMode, whitelistRole, whitelistIds, blacklistIds){	
	
	//Default perms 
	let	canManage = false;
	let canSend = true;
	
	if(guildManagerIds.includes(userId)){
		canManage = true;
		canSend = true;
	}else if(listMode === 'blacklist' && blacklistIds.includes(userId)){
		canManage = false;
		canSend = false;
	}else if(stickerManagerIds.includes(userId)){
		canManage = true;
		canSend = true;
	}else if(listMode === 'whitelist' && whitelistRole != '@everyone' && !whitelistIds.includes(userId)){
		canManage = false;
		canSend = false;
	}

	return {canManage, canSend};
}
