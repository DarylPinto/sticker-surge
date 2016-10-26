const mongoose = require('mongoose');
const StickerPack = require('../models/sticker-pack.js');
const User = require('../models/user.js');
const Guild = require('../models/guild.js');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/test');
const db = mongoose.connection;
db.on('error', err => util.handleError(err));


User.find({})
.then(users=>{

	console.log(users.map(u=>u.username));

});

/*Guild.findOne({"prefix": "!"})
.then(guild=>{

	console.log(guild.stickerPacks[0].populate());

});*/

/*StickerPack.findOne({"key":"melee"})
.then(pack=>{
	
	pack.stickers.push({
		name: 'ddd',
		url: 'http://i.imgur.com/l5NXYv6.png',
		uses: 0,
		createdAt: new Date()
	});

	pack.save();

});*/


/*Promise.all([
	Guild.findOne({"prefix": "!"}),
	StickerPack.findOne({"key":"melee"})
])
.then(values=>{

	let guild = values[0];
	let pack = values[1];
	
	//console.log(pack._id);
	guild.stickerPacks.push(pack._id);

	guild.save();

});*/