if(!Array.prototype.includes){
	Array.prototype.includes = function(item){
		return this.indexOf(item) > -1;
	}
}

//Determine if user can manage stickers in a guild
module.exports = function(guild, userId, userGuilds){	
	if(!userId) return false; //User must be logged in
	else if(!userGuilds.includes(guild.id)) return false; //User must be part of guild
	else if(guild.guildManagerIds.includes(userId)) return true; //User can edit if guildManager
	else if(guild.listMode === 'blacklist' && guild.blacklist.userIds.includes(userId)) return false; //User cannot edit if blacklisted
	else if(guild.stickerManagers.roleId === '@everyone' || guild.stickerManagers.userIds.includes(userId)) return true;
	return false;
}
