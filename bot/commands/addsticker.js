const util = require('../assets/utility-functions.js');
const replies = require('../assets/replies.js');
const emojis = require('../assets/emojis.json');

module.exports = function(message, dbDocument){

	let messageWords = message.content.trim().split(' ');
	let prefix = dbDocument.prefix || '';

	if(
		messageWords.length < 2 ||
	  !util.msgHasImgAttached(message) &&
	  (messageWords.length < 3 || !util.linkIsDirectImg(messageWords[2]))
	){
		replies.use(message, 'invalidAddSyntax', {'%%PREFIX%%': prefix});
		return false; 
	}else if(emojis.includes(messageWords[1])){
		replies.use(message, 'addNameConflictsEmojis', {
			'%%PREFIX%%': prefix,
			'%%EMOJI%%': messageWords[1].toLowerCase()
		});
		return false;
	}else if(
		(message.channel.type == 'dm' && ! /^:?-?[a-zA-Z0-9]+:?$/.test(messageWords[1]) ) ||
		(message.channel.type == 'text' && ! /^:?[a-zA-Z0-9]+:?$/.test(messageWords[1]) )
	){
		replies.use(message, 'illegalAddCharacters', {'%%PREFIX%%': prefix});
		return false; 
	}

	let stickerName = messageWords[1].toLowerCase().replace(/(-|:)/g, '');
	let stickerURL = (util.msgHasImgAttached(message)) ? message.attachments.array()[0].proxyURL : messageWords[2];

	//check if sticker exists
	let stickerExists = false;
	dbDocument.customStickers.forEach(s=>{
		if(s.name == stickerName) stickerExists = true;
	});

	if(stickerExists){
		replies.use(message, 'stickerAlreadyExists');
	}else{
		dbDocument.customStickers.push({
			name: stickerName,
			url: stickerURL,
			uses: 0,
			createdAt: new Date()
		});
		dbDocument.save()
		.then(()=>{
			replies.use(message, 'addSticker', {'%%STICKERNAME%%': stickerName});
		});
	}

}