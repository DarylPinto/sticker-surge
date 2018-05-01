const rp = require('request-promise');
const covert = require('../../covert.js');

module.exports = function(guild, bot_auth){

	let guild_manager_ids = guild.members.filter(m => m.hasPermission('MANAGE_GUILD')).map(m => m.id);
	let sticker_manager_role;
	let sticker_manager_ids;
	let whitelisted_role;
	let blacklisted_role;
	let list_mode;

	rp({uri: `${covert.app_url}/api/guilds/${guild.id}`, json: true})
	.then(res => {

		//role_obj is set to the `Role` object from Discord.js that matches
		//the guild's stickerManagerRole id. If there isn't one that matches,
		//then either the role has been deleted, or the role is '@everyone' (not an id)
		//In either case, we want to update the guild to have '@everyone' as it's stickerManagerRole
		//And empty the 'stickerManagerIds' array
		let sticker_manager_role_obj = guild.roles.find(r => r.id === res.stickerManagerRole);
		let whitelist_role_obj = guild.roles.find(r => r.id === res.whitelistRole);
		let blacklist_role_obj = guild.roles.find(r => r.id === res.blacklistRole);
		list_mode = res.list_mode;

		if(!sticker_manager_role_obj){
			sticker_manager_role = '@everyone';
			sticker_manager_ids = [];
		}
		//Otherwise, the role exists and we update the stickerManagerIds array like normal
		else{	
			sticker_manager_role = res.stickerManagerRole;
			sticker_manager_ids = sticker_manager_role_obj.members.map(m => m.id);
		}

		if(!whitelist_role_obj) whitelisted_role = '@everyone';
		if(!blacklist_role_obj){
			blacklisted_role = null;
			whitelisted_role = '@everyone';
			list_mode = 'whitelist';
		}

	})
	.then(() => {

		return rp({
			method: 'PATCH',
			uri: `${covert.app_url}/api/guilds/${guild.id}`,
			body: {
				isActive: true,
				guildName: guild.name,
				icon: guild.icon || null,
				listMode: list_mode,
				whitelistRole: whitelisted_role,
				whitelistIds: whitelist_ids,
				blacklistRole: blacklisted_role,
				blacklistIds: blacklist_ids,
				stickerManagerRole: sticker_manager_role,
				stickerManagerIds: sticker_manager_ids,
				guildManagerIds: guild_manager_ids	
			},
			headers: {Authorization: bot_auth},
			json: true
		});

	})
	.catch(err => {
		console.error("Error updating guild info:\n" + err.message);	
	});
	
}