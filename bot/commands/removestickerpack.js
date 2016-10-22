const util = require('../assets/utility-functions.js');
const replies = require('../assets/replies.js');
const StickerPack = require('../../models/sticker-pack.js');

module.exports = function(message, dbDocument){

	let messageWords = message.content.trim().split(' ');
	let prefix = dbDocument.prefix || '';	

	if(messageWords.length < 2){
		replies.use(message, 'invalidRemovePackSyntax', {'%%PREFIX%%': prefix});
		return false;
	}

	let packKey = messageWords[1];

	if(!dbDocument.stickerPacks.includes(packKey)){
		replies.use(message, 'removePackNotIncluded');
		return false;
	}

	StickerPack.findOne({'key': packKey})
	.then(pack=>{

		pack.installs--;
		pack.save();

		let index = dbDocument.stickerPacks.indexOf(pack.key);
		dbDocument.stickerPacks.splice(pack.key, 1);
		dbDocument.save()
		.then(()=>{
			replies.use(message, 'removeStickerPack', {'%%PACKNAME%%': pack.name});
		});

	}).catch(err => util.handleError(err, message));

}