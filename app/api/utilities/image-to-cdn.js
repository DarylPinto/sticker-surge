const AWS = require('aws-sdk');
const sharp = require('sharp');
const snekfetch = require('snekfetch');
const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');

AWS.config.update({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_ACCESS_SECRET_ACCESS_KEY 
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

		//Resize to fit within 250x250
		sticker = await sharp(sticker).resize(250, 250, {
			fit: 'inside', withoutEnlargement: true
		}).toBuffer();

		//Compress
		sticker = await imagemin.buffer(sticker, {
			plugins: [
				imageminPngquant({ quality: [0.65, 0.8] })
			]
		});

		//Upload to S3
		await s3upload({
			Bucket: 'stickers-for-discord',
			Key: `${name}.png`,
			Body: sticker,
			ContentType: 'image/png',
			ACL: 'public-read'
		});

		return Promise.resolve(`https://s3.us-east-2.amazonaws.com/stickers-for-discord/${encodeURIComponent(name)}.png`);

	}catch(err){
		return Promise.reject(err);
	}

}