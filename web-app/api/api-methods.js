const sizeOf = require('request-image-size');
const cloudinary = require('cloudinary');
const special = require('../../common/assets/special.json');
const emojis =  require('../../common/assets/emojis.json');

cloudinary.config(special.cloudinary);

//Promise wrapper for cloudinary upload
//Cloudinary upload function already allows for returning a promise, but
//doing so makes it unable to use uploadSettings
function cloudUpload(file, uploadSettings = {}){
return new Promise((resolve, reject) => {
	cloudinary.uploader.upload(file, (res, err) => {
		if(err){
			reject(err);
		}else{
			resolve(res);
		}
	}, uploadSettings);
});
}

//Promise wrapper for size of image URL
function sizeOfImageURL(url){
return new Promise((resolve, reject) => {
	sizeOf(url, (err, res) => {
		if(err){
			reject(err);
		}else{
			resolve(res);
		}
	});
});
}

function validateStickerPostRequest(req, dbDocument, stickerArrayName){
return new Promise((resolve, reject) => {

	let stickers = dbDocument[stickerArrayName];
	let maxWidth = 300;
	let maxHeight = 300;

	//ensure request body has name and url
	if(!req.body.name || !req.body.url){
		reject("Incomplete request body");	
		return;
	}

	//ensure name contains only lowercase letters and numbers and 
	else if(! /^[a-z0-9]+$/.test(req.body.name)){
		reject("Sticker name must consist of lowercase letters and numbers only");
		return;
	}

	//ensure name isn't used by an emoji
	else if(emojis.includes(req.body.name)){
		reject("Sticker name already in use by an emoji");
		return;
	}

	//ensure name isn't already used
	else if(stickers.map(s=>s.name).includes(req.body.name)){
		reject("Sticker name already in use");
		return;
	}

	else{

		if(req.body.url.includes('cloudinary.com/stickers-for-discord/image/')){
			resolve([req.body.url, dbDocument]);
			return;
		}else{
			sizeOfImageURL(req.body.url)
			.then(dimensions => {
				let uploadSettings = {format: "png"};

				if(dimensions.height >= maxHeight || dimensions.width >= maxWidth){
					uploadSettings.height = maxHeight;
					uploadSettings.width = maxWidth;
					uploadSettings.crop = "fit";
				}

				cloudUpload(req.body.url, uploadSettings)
				.then(upload => resolve([upload.url, dbDocument]))
				.catch(err => reject("A CDN error occured"));

			})
			.catch(err => {
				reject("Could not verify image URL");
			});
		}

	}

});
}

module.exports = {
	validateStickerPostRequest
}