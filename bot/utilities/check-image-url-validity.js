const rp = require('request-promise');
const allowed_types = ['image/jpeg', 'image/png'];

//Returns true if uri is a valid jpeg or png, false if otherwise
module.exports = function(uri){return new Promise((resolve, reject) => {

	rp({uri, resolveWithFullResponse: true})
	.then(res => {
		if(allowed_types.includes(res.headers['content-type'])) resolve(true)
		else resolve(false)
	})
	.catch(() => resolve(false));

})}