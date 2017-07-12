const fs = require('fs');
const {promisify} = require('util');
const AWS = require('aws-sdk');
const sharp = require('sharp');
const snekfetch = require('snekfetch');
const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');
const covert = require('../../../covert.js');

AWS.config.update({
	accessKeyId: covert.aws.access_key_id,
	secretAccessKey: covert.aws.secret_access_key
});

const s3 = new AWS.S3();

//Promisify
const readFileAsync = promisify(fs.readFile);
const s3upload = function(options){return new Promise((resolve, reject) => {
	s3.putObject(options, (err, res) => {
		if(err) return reject(err);
		resolve(res);
	});
})};

/**
* Uploads a resized and compressed image to AWS S3
*
* @param {String} image - Path to image file on server, or direct URL to online image
* @param {String} imageName - Name of the image to be used on the CDN
* @param {Boolean} imageIsLocal - True if `image` is a path on the server, false if `image` is a URL to an online image
*
* @returns {Promise} - URL of image on S3
*/
module.exports = async function(image, imageName, imageIsLocal){

	let sticker;

	try{

		//Image buffer
		if(imageIsLocal){
			sticker = await readFileAsync(image);
		}
		else{
			let response = await snekfetch.get(image);
			sticker = response.body;
		}

		//Resize to fit within 300x300
		sticker = await sharp(sticker)
		.resize(300, 300)
		.max()
		.toFormat('png')
		.withoutEnlargement()
		.toBuffer();

		//Compress
		sticker = await imagemin.buffer(sticker, {
			plugins: [imageminPngquant({quality: '65-80'})]
		});

		//Upload to S3
		await s3upload({
			Bucket: 'stickers-for-discord',
			Key: `${imageName}.png`,
			Body: sticker,
			ACL: 'public-read'
		});

		if(imageIsLocal) fs.unlink(image, () => {});
		return Promise.resolve(`https://s3.us-east-2.amazonaws.com/stickers-for-discord/${imageName}.png`);

	}catch(err){
		return Promise.reject(err);
	}

}