module.exports = function({
	userId = null,
	guildManagerIds = [],
	stickerManagerRole = null,
	stickerManagerIds = [],
	listMode = null,
	whitelistRole = null,
	whitelistIds = [],
	blacklistIds = []
} = {}){

	//Base permissions 
	let isGuildManager = guildManagerIds.includes(userId);
	let isBlacklisted = !isGuildManager && (listMode === 'blacklist' && blacklistIds.includes(userId));
	let isWhitelisted = isGuildManager || whitelistRole === '@everyone' || (listMode === 'whitelist' && whitelistIds.includes(userId));
	let isStickerManager = isGuildManager || stickerManagerRole === '@everyone' || stickerManagerIds.includes(userId);

	//If whitelisted and blacklisted, user should be blacklisted 
	if(!isGuildManager && isWhitelisted && isBlacklisted){
		isBlacklisted = true;
		isWhitelisted = false;
	}

	//Calculate final permissions
	let canManage = isGuildManager || (isStickerManager && !isBlacklisted);
	let canSend = isGuildManager || (isWhitelisted && !isBlacklisted);

	return {canManage, canSend};
}
