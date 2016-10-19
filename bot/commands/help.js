const replies = require('../replies.js');

module.exports = function(message, dbDocument){

	let prefix = '';
	if(dbDocument) prefix = dbDocument.prefix;

	replies.use(message, 'help', {'%%PREFIX%%': prefix});

}