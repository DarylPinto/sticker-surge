const rp = require('request-promise');
const Guild = require('../models/guild-model.js');

module.exports = {
	
	//Get object `obj` without properties in `propArr`
	removeProps(obj, propArr){
		let clone = Object.assign({}, obj);
		propArr.forEach(prop => {
			delete clone[prop];
		});
		return clone;
	},

	//Get object `obj` with only the properties in `propArr`
	withProps(obj, propArr){
		let clone = {}; 
		propArr.forEach(prop => {
			clone[prop] = obj[prop];
		});
		return clone;
	},

	//Set cookie "guilds" as an array of guild id's that the user is a member of AND are in the guild db collection
	//The cookie is added to the session as a tamper proof httpOnly cookie and as a standard cookie for the view to use
	setGuildsCookie(req, res, user_access_token){return new Promise((resolve, reject) => {

		let user_guilds_request = rp({
			method: 'GET',
			uri: 'https://discordapp.com/api/users/@me/guilds',
			headers: {'Authorization': `Bearer ${user_access_token}`}
		});

		let all_sticker_guilds = Guild.find({});

		Promise.all([user_guilds_request, all_sticker_guilds])
		.then(data => {	

			let user_guild_ids = JSON.parse(data[0]).map(g => g.id);
			let all_sticker_guild_ids = data[1].map(g => g.id);

			let guilds_cookie = all_sticker_guild_ids.filter(id => user_guild_ids.includes(id));

			//Set cookies
			res.cookie('guilds', JSON.stringify(guilds_cookie));
			req.session.guilds = guilds_cookie;

			resolve();

		})
		.catch(err => {
			reject(err);
		});

	})}
	
}