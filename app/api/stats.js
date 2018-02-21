const router = require('express').Router();
const Guild = require('./models/guild-model.js');
const User = require('./models/user-model.js');

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

module.exports = router;
