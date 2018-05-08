const router = require('express').Router();
const Guild = require('./models/guild-model.js');
const User = require('./models/user-model.js');

//Live stats count
router.get('/', async (req, res) => {

	try{

		//Total Guild Stickers
		let guild_sticker_count = await Guild.aggregate([
			{$unwind: "$customStickers"},
			{$group: {_id: null, stickerNames: {$push: "$customStickers.name"}}},
			{$project: {_id: false, amount: {$size: "$stickerNames"}}}
		]);

		//Total User Stickers
		let user_sticker_count = await User.aggregate([
			{$unwind: "$customStickers"},
			{$group: {_id: null, stickerNames: {$push: "$customStickers.name"}}},
			{$project: {_id: false, amount: {$size: "$stickerNames"}}}
		]);

		//Convert queries to numbers
		guild_sticker_count = (guild_sticker_count.length > 0) ? guild_sticker_count[0].amount : 0;
		user_sticker_count = (user_sticker_count.length > 0) ? user_sticker_count[0].amount : 0;	

		return res.json({
			active_guilds: await Guild.count({isActive: true}),
			inactive_guilds: await Guild.count({isActive: false}),
			users: await User.count({}),
			stickers: guild_sticker_count + user_sticker_count
		});

	}catch(err){
		console.error("Error fetching stats: " + err.message);
		res.status(500).send('Internal server error');
	}

});

//25 Most Recently Created Guild/User Stickers
router.get('/recent-stickers', async (req, res) => {

	try{

		let guild_stickers = await Guild.aggregate([
			{$unwind: "$customStickers"},
			{$sort: {"customStickers.createdAt": -1}},
			{$group: {_id: null, stickers: {$push: "$customStickers"}}},
			{$project: {_id: null, stickers: {$slice: ["$stickers", 25]}}}
		]);

		let user_stickers = await User.aggregate([
			{$unwind: "$customStickers"},
			{$sort: {"customStickers.createdAt": -1}},
			{$group: {_id: null, stickers: {$push: "$customStickers"}}},
			{$project: {_id: null, stickers: {$slice: ["$stickers", 25]}}}
		]);

		guild_stickers = guild_stickers[0] ? guild_stickers[0].stickers : [];
		user_stickers = user_stickers[0] ? user_stickers[0].stickers : [];

		guild_stickers.forEach(s => delete s._id);
		user_stickers.forEach(s => delete s._id);

		return res.json({guild_stickers, user_stickers});

	}catch(err){
		console.error("Error fetching stats: " + err.message);
		res.status(500).send('Internal server error');
	}

});

//25 Most Used Guild/User Stickers
router.get('/most-used-stickers', async (req, res) => {

	try{

		let guild_stickers = await Guild.aggregate([
			{$unwind: "$customStickers"},
			{$sort: {"customStickers.uses": -1}},
			{$group: {_id: null, stickers: {$push: "$customStickers"}}},
			{$project: {_id: null, stickers: {$slice: ["$stickers", 25]}}}
		]);

		let user_stickers = await User.aggregate([
			{$unwind: "$customStickers"},
			{$sort: {"customStickers.uses": -1}},
			{$group: {_id: null, stickers: {$push: "$customStickers"}}},
			{$project: {_id: null, stickers: {$slice: ["$stickers", 25]}}}
		]);

		guild_stickers = guild_stickers[0] ? guild_stickers[0].stickers : [];
		user_stickers = user_stickers[0] ? user_stickers[0].stickers : [];

		guild_stickers.forEach(s => delete s._id);
		user_stickers.forEach(s => delete s._id);

		return res.json({guild_stickers, user_stickers});

	}catch(err){
		console.error("Error fetching stats: " + err.message);
		res.status(500).send('Internal server error');
	}

});

module.exports = router;
