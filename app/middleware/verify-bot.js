const covert = require('../../covert.js');

module.exports = function(req, res, next){	

	console.log(req.headers);

	//Verify discord bot
	let bot_auth = `Basic ${new Buffer(covert.bot_token_hash).toString('base64')}`;

	if(req.headers.authorization && req.headers.authorization === bot_auth){
		next();
	}else{
		res.status(401).send('Unauthorized');
	}

}