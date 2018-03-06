//Send message to a guild's default channel
//If #general doesn't exist, iterate through channels by `calculatedPosition`
//And send message to first channel that we have permission to
module.exports = function(guild, message){
	let channels = guild.channels.array().filter(c => c.type === 'text');
	let general_channel = (channels.map(c => c.name).includes('general')) ? channels[channels.map(c => c.name).indexOf('general')] : null;

	let sorted_channels = channels.sort((a, b) => {
		if(a.calculatedPosition < b.calculatedPosition) return -1;
		else if(b.calculatedPosition < a.calculatedPosition) return 1;
		else return 0;
	});

	if(general_channel) sorted_channels.unshift(general_channel);

	let channel_index = 0;

	function attemptMessage(){
		sorted_channels[channel_index].send(message)	
		.catch(err => {
			channel_index++;
			if(channel_index < sorted_channels.length) attemptMessage();
		});
	}

	attemptMessage();
}
