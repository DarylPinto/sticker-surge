const cloudinary = require('cloudinary');
const util = require('../assets/utility-functions.js');
const replies = require('../assets/replies.js');
const special = require('../../common/assets/special.json');
const emojis = require('../../common/assets/emojis.json');

cloudinary.config(special.cloudinary);

module.exports = function(message, dbDocument){

	let messageWords = message.content.trim().split(/\s+/);
	let prefix = dbDocument.prefix || '';
	let guildEmojis = [];
	let maxHeight = 300;
	let maxWidth = 300;

	//Detect guild emojis
	if(message.channel.type == 'text'){
		guildEmojis = message.channel.guild.emojis.array();
	}

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
			'%%EMOJI%%': ":"+messageWords[1].toLowerCase()+":"
		});
		return false;
	}else if(guildEmojis.map(e=>e.name).includes(messageWords[1])){

		let index = guildEmojis.map(e=>e.name).indexOf(messageWords[1]);

		replies.use(message, 'addNameConflictsEmojis', {
			'%%PREFIX%%': prefix,
			'%%EMOJI%%': guildEmojis[index]
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

	util.sizeOfImageURL(stickerURL)
	.then(dimensions => {

		let uploadSettings = {format: "png"};

		if(dimensions.height >= maxHeight || dimensions.width >= maxWidth){
			uploadSettings.height = maxHeight;
			uploadSettings.width = maxWidth;
			uploadSettings.crop: "fit";
		}

		return util.cloudUpload(stickerURL, uploadSettings);

	})
	.then(upload =>{

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
				url: upload.url,
				uses: 0,
				createdAt: new Date()
			});
			dbDocument.save()
			.then(()=>{
				replies.use(message, 'addSticker', {'%%STICKERNAME%%': stickerName});
			});
		}

	}).catch(err => util.handleError(err));

}