const replies = require('../assets/replies.js');

module.exports = function(message, dbDocument){

	let messageWords = message.content.toLowerCase().trim().split(' ');
	let prefix = dbDocument.prefix || '';

	if(messageWords.length != 2){
		replies.use(message, 'invalidRemoveSyntax', {'%%PREFIX%%': prefix});
		return false;
	}

	let oldStickerAmount = dbDocument.customStickers.length;
	dbDocument.customStickers = dbDocument.customStickers.filter(sticker=>{
		return sticker.name !== messageWords[1];
	});
	let newStickerAmount = dbDocument.customStickers.length;
	
	dbDocument.save()
	.then(() => {
		if(oldStickerAmount - newStickerAmount > 0){
			replies.use(message, 'removeSticker', {'%%STICKERNAME%%': messageWords[1]});	
		}else{
			replies.use(message, 'removeStickerNotFound');	
		}
	});

}