const covert = require('../../../covert.js');
const cloudinary = require('cloudinary');
cloudinary.config(covert.cloudinary);

/**
* Deletes an image from cloudinary CDN
*
* @param {String} url - Path to image file on server, or direct URL to online image
*/
module.exports = function(url){
	let public_id = url.substring(url.lastIndexOf('/') + 1, url.length - 4);
	cloudinary.uploader.destroy(public_id);
}