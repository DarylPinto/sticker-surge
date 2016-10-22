const util = require('../assets/utility-functions.js');
const replies = require('../assets/replies.js');
const StickerPack = require('../../models/sticker-pack.js');

module.exports = function(message, dbDocument){

	let messageWords = message.content.trim().split(' ');
	let prefix = dbDocument.prefix || '';	

	if(messageWords.length < 2){
		replies.use(message, 'invalidAddPackSyntax', {'%%PREFIX%%': prefix});
		return false;
	}

	let packKey = messageWords[1];

	if(dbDocument.stickerPacks.includes(packKey)){
		replies.use(message, 'addPackAlreadyIncluded', {'%%PACKKEY%%': packKey});
		return false;
	}

	StickerPack.findOne({'key': packKey})
	.then(pack=>{

		if(pack == null){
			replies.use(message, 'addPackDoesntExist', {'%%PACKKEY%%': packKey});
			return false;
		}

		pack.installs++;
		pack.save();

		dbDocument.stickerPacks.push(pack.key);
		dbDocument.save()
		.then(()=>{
			replies.use(message, 'addStickerPack', {
				'%%PACKKEY%%': pack.key,
				'%%PACKNAME%%': pack.name
			});
		});

	}).catch(err => util.handleError(err, message));

}