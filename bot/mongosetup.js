//This file is for testing purposes

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

let db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function(){

	let guildSchema = mongoose.Schema({
		id: Number,
		managerRole: String,
		customStickers: [
			{
				name: String,
				url: String,
				creatorId: Number,
				uses: Number
			}
		],
		stickerPacks: Array
	});

	let Guild = mongoose.model('Guild', guildSchema);


	Guild.findOne({id: 1233}, function(err, sample){
		if(err) return console.error(err);
		let	myguild = sample;
		console.log(myguild.customStickers[0].url);
	});


});