const mongoose = require('mongoose');
const StickerPack = require('../models/sticker-pack.js');
const User = require('../models/user.js');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/test');
const db = mongoose.connection;
db.on('error', err => util.handleError(err));

StickerPack.findOne({"key":"melee"})
.then(pack=>{
	
	pack.stickers.push({
		name: 'ddd',
		url: 'http://i.imgur.com/l5NXYv6.png',
		uses: 0,
		createdAt: new Date()
	});

	pack.save();

});