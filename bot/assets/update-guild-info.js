const rp = require('request-promise');
const covert = require('../../covert.js');

module.exports = function(guild){

	let manager_role_name;
	let manager_role;
	let manager_ids;

	rp(`${covert.app_url}/api/guilds/${guild.id}`)
	.then(res => {
		manager_role_name = JSON.parse(res).managerRole;
		manager_role = guild.roles
			.array()
			.find(r => r.name === manager_role_name) || null;
		manager_ids = (manager_role && manager_role_name != '@everyone') ? manager_role.members.map(m => m.user.id) : [];
	})
	.then(() => {

		return rp({
			method: 'PATCH',
			uri: `${covert.app_url}/api/guilds/${guild.id}`,
			body: {	
				managerIds: manager_ids,	
				icon: guild.icon || null
			},
			json: true
		});

	})
	.catch(err => {
		console.error(err.message);
	});
	
}