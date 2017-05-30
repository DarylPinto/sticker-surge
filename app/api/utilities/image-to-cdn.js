const fs = require('fs');
const imageSize = require('image-size');
const requestImageSize = require('request-image-size');
const covert = require('../../../covert.js');
const cloudinary = require('cloudinary');
cloudinary.config(covert.cloudinary);

//Take image (url string or file) and upload to cloudinary
//return Promise with cloudinary URL
module.exports = function(image, imageIsLocal){return new Promise((resolve, reject) => {

	let sizeOf = imageIsLocal ? imageSize : requestImageSize;

	let uploadSettings = {
		crop: 'fit',
		format: 'png'
	}

	if(!imageIsLocal && image.includes('res.cloudinary.com/stickers-for-discord/')){
		resolve(image);
		return;
	}

	sizeOf(image, (err, size) => {

		if(err){
			reject(err);
			return;
		}

		if(size.width > 300) uploadSettings.width = 300;
		if(size.height > 300) uploadSettings.height = 300;	

		cloudinary.uploader.upload(image, (res, err) => {
			if(err){
				reject(err);
				return;
			}

			resolve(res.secure_url);
			if(imageIsLocal) fs.unlink(image);

		}, uploadSettings);

	});

})}