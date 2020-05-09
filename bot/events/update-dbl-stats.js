const DBL = require('dblapi.js');

//Update guild count on Discord Bot List
module.exports = function(guild_count){

	if(!process.env.TOPGG_ENABLED || !process.env.TOPGG_API_KEY) return false;	
	const dbl = new DBL(process.env.TOPGG_API_KEY);

	dbl.postStats(guild_count);

}
