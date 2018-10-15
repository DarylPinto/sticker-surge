const rp = require('request-promise');
const Guild = require('../api/models/guild-model.js');

/**
* Set `guilds` cookie as an array of guild IDs that the user is a member of AND are registered in Stickers for Discord.
* The cookie is added to the session as a tamper proof httpOnly cookie and as a standard easily readable cookie for
* the view layer to use
*/
async function setGuildsCookie(req, res, next){

	if(!req.session.token) return next();

	try{

		// User's guilds
		const user_guilds_request = await rp({
			method: 'GET',
			uri: 'https://discordapp.com/api/users/@me/guilds',
			headers: {'Authorization': `Bearer ${req.session.token}`},
			json: true
		});
		const user_guild_ids = user_guilds_request.map(g => g.id);

		// Guilds bot and user have in common
		const common_guilds = await Guild.find({isActive: true, id: {$in: user_guild_ids}});	
		const guilds_cookie = common_guilds.map(g => g.id);	

		//Set cookies
		res.cookie('guilds', JSON.stringify(guilds_cookie), {
			expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) //1 year
		});
		req.session.guilds = guilds_cookie;

		next();

	}catch(err){
		if(err.response && err.response.body && err.response.body.retry_after){
			//Request user guilds again after Discord's rate limit ends
			let retry_after = err.response.body.retry_after;
			setTimeout(() => setGuildsCookie(req, res, next), retry_after + 100);
		}else{
			console.error(err);
			next();
		}
	}

}

module.exports = setGuildsCookie;