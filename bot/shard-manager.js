// Sharding Manager spawns multiple processes to allow the bot to connect to > 2500 servers.
// Must spawn 1 shard for every 2500 servers
// https://anidiots.guide/understanding/sharding

const Discord = require('discord.js');
const Manager = new Discord.ShardingManager('./bot.js');
const rp = require('request-promise');
const updateDblStats = require('./events/update-dbl-stats.js');
const covert = require('../covert.js');

async function main(){

	// Get stats from API
	const stats = await rp({uri: `${covert.app_url}/api/stats`, json: true});	
	const guild_count = stats.active_guilds;
	const shard_count = Math.ceil(guild_count/2500);	
	
	// Spawn shards
	console.log(`Spawning ${shard_count} shards to handle ${guild_count} guilds.`);
	Manager.spawn(shard_count);

	// Update Discord Bot List stats every half hour
	setInterval(() => {
		updateDblStats(guild_count);
	}, 1000 * 60 * 30);

}

main();
