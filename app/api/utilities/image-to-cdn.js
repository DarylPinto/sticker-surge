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
const s3upload = function(options){return new Promise((resolve, reject) => {
	s3.putObject(options, (err, res) => {
		if(err) return reject(err);
		resolve(res);
	});	
})}

/**
* Uploads a resized and compressed image to AWS S3
*
* @param {String} image - File buffer, or direct URL to online image
* @param {String} name - Name of the image to be used on the CDN
*
* @returns {Promise} - URL of image on S3
*/
module.exports = async function(image, name){

	let sticker;

	try{

		//Image buffer
		if(typeof image === 'string'){
			let fetched_image = await snekfetch.get(image);
			sticker = fetched_image.body;
		}
		else{
			sticker = image;	
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
			Key: `${name}.png`,
			Body: sticker,
			ContentType: 'image/png',
			ACL: 'public-read'
		});

		return Promise.resolve(`https://s3.us-east-2.amazonaws.com/stickers-for-discord/${name}.png`);

	}catch(err){
		return Promise.reject(err);
	}

}