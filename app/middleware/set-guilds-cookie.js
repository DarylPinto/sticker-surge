const rp = require('request-promise');
const Guild = require('../api/models/guild-model.js');

/**
* Set `guilds` cookie as an array of guild IDs that the user is a member of AND are registered in Stickers for Discord.
* The cookie is added to the session as a tamper proof httpOnly cookie and as a standard easily readable cookie for
* the view layer to use
*/
function setGuildsCookie(req, res, next){

	if(!req.session.token) return next();

	let user_guilds_request = rp({
		method: 'GET',
		uri: 'https://discordapp.com/api/users/@me/guilds',
		headers: {'Authorization': `Bearer ${req.session.token}`},
		json: true
	});

	let all_sticker_guilds = Guild.find({isActive: true});

	Promise.all([user_guilds_request, all_sticker_guilds])
	.then(data => {	

		let user_guild_ids = data[0].map(g => g.id);
		let all_sticker_guilds = data[1].map(g => g.id);
		let guilds_cookie = all_sticker_guilds.filter(id => user_guild_ids.includes(id));	

		//Set cookies
		res.cookie('guilds', JSON.stringify(guilds_cookie), {
			expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) //1 year
		});
		req.session.guilds = guilds_cookie;

		next();

	})
	.catch(err => {

		if(err.response && err.response.body && err.response.body.retry_after){
			//Request user guilds again after Discord's rate limit ends
			let retry_after = err.response.body.retry_after;
			setTimeout(() => setGuildsCookie(req, res, next), retry_after + 100);
		}else{
			console.error(err);
			next();
		}
		
	});

}

module.exports = setGuildsCookie;