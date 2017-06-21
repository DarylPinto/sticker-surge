const rp = require('request-promise');

module.exports = function(message, prefix, contentRole, managerRole, guildData){

	contentRole = contentRole === '@everyone' ? 'everyone' : contentRole;
	managerRole = managerRole === '@everyone' ? 'everyone' : managerRole;

	message.channel.send(`
**Custom Stickers**: ${guildData.customStickers.length}
**Content Creator Role**: ${contentRole}
**Manager Role**: ${managerRole}
`);

}