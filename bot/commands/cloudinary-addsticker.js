const cloudinary = require('cloudinary');
const util = require('../assets/utility-functions.js');
const replies = require('../assets/replies.js');
const special = require('../assets/special.json');

cloudinary.config(special.cloudinary);

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
	}else if(
		(message.channel.type == 'dm' && ! /^:?-?[a-zA-Z0-9]+:?$/.test(messageWords[1]) ) ||
		(message.channel.type == 'text' && ! /^:?[a-zA-Z0-9]+:?$/.test(messageWords[1]) )
	){
		replies.use(message, 'illegalAddCharacters', {'%%PREFIX%%': prefix});
		return false; 
	}

	let stickerName = messageWords[1].toLowerCase().replace(/(-|:)/g, '');
	let stickerURL = (util.msgHasImgAttached(message)) ? message.attachments.array()[0].proxyURL : messageWords[2];

	cloudinary.uploader.upload(stickerURL)
	.then(upload => {

		let cloudURL = upload.url;
		let maxHeight = 300;
		let maxWidth = 300;

		//If uploaded image is bigger than limits set above, save a size-modified cloudinary URL
		if(upload.height > maxHeight || upload.width > maxWidth){
			let temp = cloudURL.split('/image/upload/');
			cloudURL = temp.join(`/image/upload/w_${maxWidth.toString()},h_${maxHeight.toString()},c_fit/`);	
		}

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
				url: cloudURL,
				uses: 0,
				createdAt: new Date()
			});
			dbDocument.save()
			.then(()=>{
				replies.use(message, 'addSticker', {'%%STICKERNAME%%': stickerName});
			});
		}

	}).catch(err => util.handleError(err, message));

}