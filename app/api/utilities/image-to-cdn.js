const fs = require('fs');
const covert = require('../../../covert.js');
const cloudinary = require('cloudinary');
cloudinary.config(covert.cloudinary);

//Take image (url string or file) and upload to cloudinary
//return Promise with cloudinary URL
module.exports = function(image, imageIsLocal){

	uploadSettings = {
		crop: 'fit',
		height: 300,
		width: 300,
		format: 'png'
	}
	
	return new Promise((resolve, reject) => {

		//TODO: check if url is a cloudinary url already

		cloudinary.uploader.upload(image, (res, err) => {
			if(err){
				reject(err);
			}else{
				resolve(res.secure_url);
				if(imageIsLocal) fs.unlink(image);
			}
		}, uploadSettings);
	});

	//TODO: delete image from temp folder

}