const rp = require('request-promise');
const initGuild = require('./init-guild.js');
const covert = require('../../covert.js');

module.exports = function(guild, bot_auth){

	let guildManagerIds = guild.members.filter(m => m.hasPermission('MANAGE_GUILD')).map(m => m.id);	
	let listMode;
	let whitelist;
	let blacklist;
	let stickerManagers;

	rp({uri: `${covert.app_url}/api/guilds/${guild.id}`, json: true})
	.then(res => {

		listMode = res.listMode;

		//Destructure from API response
		({whitelist, blacklist, stickerManagers} = res);

		//djs_role_obj is set to the `Role` object from Discord.js that matches
		//the guild's stickerManagers.roleId - If there isn't one that matches,
		//then either the role has been deleted, or the role is '@everyone' (not an id)
		//In either case, we want to update the guild to have '@everyone' as it's stickerManagers.roleId
		//And empty the 'stickerManagers.userIds' array.
		//
		//Same goes for whitelist + blacklist
		[whitelist, blacklist, stickerManagers].forEach(role => {
			let djs_role_obj = guild.roles.find(r => r.id === role.roleId);
			//console.log(djs_role_obj);
			//Restore defaults if blacklist role is missing
			if(role === blacklist && djs_role_obj === null){	
				role.roleId = null;	
				role.userIds = [];
				listMode = 'whitelist';
			}
			//Set managerrole/whitelist to everyone if managerrole/whitelist role is missing
			else if(djs_role_obj === null){
				role.roleId = '@everyone';
				role.userIds = [];
			}
			//Update user Ids
			else{ 
				role.userIds = djs_role_obj.members.map(m => m.id);
			}
		});
	
	})
	.then(() => {

		return rp({
			method: 'PATCH',
			uri: `${covert.app_url}/api/guilds/${guild.id}`,
			body: {
				isActive: true,
				guildName: guild.name,
				icon: guild.icon || null,
				listMode: listMode,
				whitelist: whitelist,
				blacklist: blacklist,
				stickerManagers: stickerManagers,
				guildManagerIds: guildManagerIds
			},
			headers: {Authorization: bot_auth},
			json: true
		});

	})
	.catch(err => {	
		if(err.message.includes("404")) {
			initGuild(guild, bot_auth);
			return;
		}	
		console.error("Error updating guild info:\n" + err.message);
	});
	
}