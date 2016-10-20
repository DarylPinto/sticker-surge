const replies = require('../assets/replies.js');

module.exports = function(message, dbDocument){

	let messageWords = message.content.trim().split(' ');
	let maxPrefixLength = 3;
	let illegalCharacters = ['@', '#', '`'];
	let prefix = dbDocument.prefix;

	if(messageWords.length < 2){
		replies.use(message, 'invalidSetPrefixSyntax', {'%%PREFIX%%': prefix});
		return false;
	}else if(messageWords[1] == prefix){
		replies.use(message, 'setPrefixIdentical', {'%%PREFIX%%': prefix});
		return false;
	}else if(messageWords[1].length > maxPrefixLength){
		replies.use(message, 'setPrefixTooLong', {'%%MAXLENGTH%%': maxPrefixLength});
		return false;
	}else if(illegalCharacters.includes(messageWords[1])){
		replies.use(message, 'illegalSetPrefixCharacter', {
			'%%ILLEGALCHARACTERS%%': illegalCharacters.map(c=>'**'+c+'**').join(' ')
		});
		return false;
	}else{

		dbDocument.prefix = messageWords[1];
		dbDocument.save()
		.then(()=>{
			replies.use(message, 'setPrefix', {
				'%%NEWPREFIX%%': messageWords[1],
				'%%PREFIX%%': prefix
			});
			replies.use(message, 'help', {'%%PREFIX%%': messageWords[1]});
		});

	}
}