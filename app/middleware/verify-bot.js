const covert = require('../../covert.js');


/**
* Verify that request is coming from official Sticker Surge bot 
*/
module.exports = function(req, res, next){	

	let bot_auth = `Basic ${Buffer.from(covert.bot_token_hash).toString('base64')}`;

	if(req.headers.authorization && req.headers.authorization === bot_auth){
		next();
	}else{
		res.status(401).send('Unauthorized');
	}

}