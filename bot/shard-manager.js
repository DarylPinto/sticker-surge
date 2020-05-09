// Sharding Manager spawns multiple processes to allow the bot to connect to > 2500 servers.
// Must spawn 1 shard for every 2500 servers
// https://anidiots.guide/understanding/sharding

require('dotenv').config({ path: require('find-config')('.env') });
const Discord = require('discord.js');
const Manager = new Discord.ShardingManager('./bot.js');
const rp = require('request-promise');
const updateDblStats = require('./events/update-dbl-stats.js');

async function main(){

	const stats_uri = `${process.env.APP_URL}/api/stats`;
	let stats, guild_count, shard_count;

	// Get stats from API
	try{
		stats = await rp({uri: stats_uri, json: true});
		guild_count = stats.active_guilds;
	}catch(err){
		return console.error("Unable to connect to Sticker Surge API.");
	}	
		
	// Spawn shards
	shard_count = (guild_count === 0) ? 1 : Math.ceil(guild_count/2500);
	console.log(`Spawning ${shard_count} shards to handle ${guild_count} guilds.`);
	Manager.spawn(shard_count);

	// Update Discord Bot List stats every half hour
	setInterval(async () => {

		try{
			stats = await rp({uri: stats_uri, json: true});
			guild_count = stats.active_guilds;	
		}catch(err){
			return;
		}

		updateDblStats(guild_count);
		
	}, 1000 * 60 * 30);

}

main();
