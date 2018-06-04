const router = require('express').Router();
const Guild = require('./models/guild-model.js');
const User = require('./models/user-model.js');
const StickerPack = require('./models/sticker-pack-model.js');

//Aggregate settings for sticker count
const count_settings = sticker_field_name => [
	{$unwind: `$${sticker_field_name}`},
	{$group: {_id: null, stickerNames: {$push: `${sticker_field_name}.name`}}},
	{$project: {_id: false, amount: {$size: "$stickerNames"}}}
];

const active_pack_settings = {$and: [{published: true}, {listed: true}]};

//Aggregate settings for top `amount` stickers by `field` prop
const topSettings = (field, amount, sticker_field_name) => [
	{$unwind: `$${sticker_field_name}`},
	{$sort: {[`${sticker_field_name}.${field}`]: -1}},
	{$group: {_id: null, stickers: {$push: `$${sticker_field_name}`}}},
	{$project: {_id: null, stickers: {$slice: ["$stickers", amount]}}}
];

//Convert query result into usable json
const parseTopResult = sticker_set => {
	sticker_set = sticker_set[0] ? sticker_set[0].stickers : [];
	sticker_set.forEach(s => delete s._id);
	return sticker_set;
}

//Live stats count
router.get('/', async (req, res) => {

	try{

		//Get totals
		let guild_sticker_count = await Guild.aggregate(count_settings('customStickers'));
		let user_sticker_count = await User.aggregate(count_settings('customStickers'));
		let pack_sticker_count = await StickerPack.aggregate(count_settings('stickers'));

		let sticker_pack_sub_count = await StickerPack.aggregate({$group: {_id: null, count: {$sum: '$subscribers'}}})

		//Convert queries to numbers
		guild_sticker_count = (guild_sticker_count.length > 0) ? guild_sticker_count[0].amount : 0;
		user_sticker_count = (user_sticker_count.length > 0) ? user_sticker_count[0].amount : 0;	
		pack_sticker_count = (pack_sticker_count.length > 0) ? pack_sticker_count[0].amount : 0;	

		return res.json({
			active_guilds: await Guild.count({isActive: true}),
			inactive_guilds: await Guild.count({isActive: false}),
			sticker_packs: await StickerPack.count(active_pack_settings),
			sticker_pack_subs: sticker_pack_sub_count[0].count,
			users: await User.count({}),
			stickers: guild_sticker_count + user_sticker_count + pack_sticker_count	
		});

	}catch(err){
		console.error("Error fetching stats: " + err.message);
		res.status(500).send('Internal server error');
	}

});

//25 Most Recently Created Guild/User Stickers
router.get('/recent-stickers', async (req, res) => {

	try{

		//Get top 25 newest
		let guild_stickers = await Guild.aggregate(topSettings('createdAt', 25, 'customStickers'));
		let user_stickers = await User.aggregate(topSettings('createdAt', 25, 'customStickers'));
		let pack_stickers = await StickerPack.aggregate(topSettings('createdAt', 25, 'stickers'));

		return res.json({
			guild_stickers: parseTopResult(guild_stickers),
			user_stickers: parseTopResult(user_stickers),
			pack_stickers: parseTopResult(pack_stickers)
		});

	}catch(err){
		console.error("Error fetching stats: " + err.message);
		res.status(500).send('Internal server error');
	}

});

//25 Most Used Guild/User Stickers
router.get('/most-used-stickers', async (req, res) => {

	try{

		//Get top 25 used
		let guild_stickers = await Guild.aggregate(topSettings('uses', 25, 'customStickers'));
		let user_stickers = await User.aggregate(topSettings('uses', 25, 'customStickers'));
		let pack_stickers = await StickerPack.aggregate(topSettings('uses', 25, 'stickers'));

		return res.json({
			guild_stickers: parseTopResult(guild_stickers),
			user_stickers: parseTopResult(user_stickers),
			pack_stickers: parseTopResult(pack_stickers)
		});

	}catch(err){
		console.error("Error fetching stats: " + err.message);
		res.status(500).send('Internal server error');
	}

});

module.exports = router;
