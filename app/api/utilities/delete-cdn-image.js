const covert = require('../../../covert.js');
const AWS = require('aws-sdk');

AWS.config.update({
	accessKeyId: covert.aws.access_key_id,
	secretAccessKey: covert.aws.secret_access_key
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