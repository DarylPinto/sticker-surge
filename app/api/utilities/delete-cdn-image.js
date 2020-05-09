const AWS = require('aws-sdk');

AWS.config.update({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_ACCESS_SECRET_ACCESS_KEY 
});

const s3 = new AWS.S3();

/**
* Deletes an image from AWS S3 CDN
*
* @param {String} url - CDN image URL
*/
module.exports = function(url){

	//Don't attempt to delete images that aren't being used on current CDN (S3)
	if(url.includes('cloudinary.com')) return;

	let sticker_filename = url.substring(url.lastIndexOf('/') + 1);

	s3.deleteObject({
		Bucket: 'stickers-for-discord',
		Key: decodeURIComponent(sticker_filename)
	}, res => {});
}
