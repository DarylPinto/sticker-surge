const rp = require('request-promise');
const covert = require('../../covert.js');

module.exports = function(guild, bot_auth){

	let manager_role_name;
	let content_role_name;

	let manager_role_ids;
	let content_role_ids;

	function roleIdsFor(role_name){
		let role = guild.roles
			.array()
			.find(r => r.name.toLowerCase() === role_name.toLowerCase()) || null;
		return (role && role_name != '@everyone') ? role.members.map(m => m.user.id) : [];
	}

	rp({uri: `${covert.app_url}/api/guilds/${guild.id}`, json: true})
	.then(res => {
		manager_role_name = res.managerRole.toLowerCase();
		content_role_name = res.contentRole.toLowerCase();

		manager_role_ids = roleIdsFor(manager_role_name);
		content_role_ids = roleIdsFor(content_role_name);
	})
	.then(() => {

		return rp({
			method: 'PATCH',
			uri: `${covert.app_url}/api/guilds/${guild.id}`,
			body: {
				managerIds: manager_role_ids,
				contentIds: content_role_ids,
				icon: guild.icon || null
			},
			headers: {Authorization: bot_auth},
			json: true
		});

	})
	.catch(err => {
		console.error(err.message);
	});
	
}