const base62 = require('base62');
const replies = require('../assets/replies.js');

module.exports = function(message, dbDocument){

	let replacements = {'%%BASE62ID%%': base62.encode(dbDocument.id)};
	if(message.channel.type == 'text'){
		replacements['%%RECENTSTICKERS%%'] = dbDocument.recentStickers.map(s=>`:${s}:`).join(', ');
	}

	replies.use(message, 'stickerInfo', replacements);

}