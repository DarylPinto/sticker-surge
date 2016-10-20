const util = require('./utility-functions');

let replies = {

//Permissions
"insufficientPermission": {
	"text":	"You need to have the role **%%ROLE%%** to do that. However, you can manage your own stickers (which are usable on any server) by private messaging me."
},

//Add sticker
"addSticker": {
	"text": "`:%%STICKERNAME%%:` sticker created. It can be used on this server by anyone.",
	"dm": "`:-%%STICKERNAME%%:` sticker created. Only you can use this sticker, but you can use it on any server that I'm on. (Note the dash preceding the name.)"
},
"invalidAddSyntax": {
	"text": "Invalid syntax. Use: `%%PREFIX%%addsticker [NAME] [IMAGE URL]` or upload an image with the comment `%%PREFIX%%addsticker [NAME]`",
	"dm": "Invalid syntax. Use: `addsticker [NAME] [IMAGE URL]` or upload an image with the comment `addsticker [NAME]`"
},
"illegalAddCharacters": {
	"text": "Invalid syntax. Sticker name must consist of letters and numbers only.",
	"dm": "Invalid syntax. Sticker name must consist of letters and numbers only."
},
"stickerAlreadyExists": {
	"text": "There's already a sticker with that name on this server.",
	"dm": "You already have a sticker with that name."
},

//Remove sticker	
"removeSticker": {
	"text": "`:%%STICKERNAME%%:` sticker removed.",
	"dm": "`:-%%STICKERNAME%%:` sticker removed."
},
"invalidRemoveSyntax": {
	"text": "Invalid syntax. Use: `%%PREFIX%%removesticker [STICKER NAME]`",
	"dm": "Invalid syntax. Use: `removesticker [STICKER NAME]`"
},
"removeStickerNotFound": {
	"text": "There is no sticker with that name on this server.",
	"dm": "None of your stickers have that name."
},

//Sticker info
"stickerInfo": {
	"text": "The 3 most recently sent stickers were: %%RECENTSTICKERS%%\nTo see all this server's stickers, click here: http://discordstickers.io/server/%%BASE62ID%%",
	"dm": "To see all of your stickers, click here: http://discordstickers.io/user/%%BASE62ID%%"
},

//Sticker help
"help": {

	//Guild help
	"text": `\`%%PREFIX%%stickers\` - View all the stickers on this server, and the names of the 3 most recently used ones.

\`%%PREFIX%%addsticker\` - Add a sticker for anyone on this server to use.

\`%%PREFIX%%removesticker\` - Remove a sticker from this server.

\`%%PREFIX%%setprefix\` - Set the prefix used to trigger these commands.

\`%%PREFIX%%setrole\` - Set the role required to modify stickers on this server.`,

	//Direct Message help
	"dm": `\`stickers\` - View all your stickers.

\`addsticker\` - Add a sticker that you can use on any server.

\`removesticker\` - Remove one of your stickers.`

},

//Set Role
"setRole": {
	"text": `Updated. Now only users with the role **%%NEWROLE%%** can manage this server's stickers!`
},
"setRoleEveryone": {
	"text": `Updated. Now everyone can manage this server's stickers!`
},
"setRoleIdentical": {
	"text": "**%%ROLENAME%%** is already the role required to manage stickers on this server."
},
"invalidSetRoleSyntax": {
	"text": "Invalid Syntax. Use: `%%PREFIX%%setrole [ROLE NAME]`"
},
"setRoleTooLong": {
	"text": "Role name cannot exceed %%MAXLENGTH%% characters."
},

//Set Prefix
"setPrefix": {
	"text": "Updated. Now commands must begin with `%%NEWPREFIX%%` instead of `%%PREFIX%%`."
},
"invalidSetPrefixSyntax": {
	"text": "Invalid Syntax. Use: `%%PREFIX%%setprefix [NEW PREFIX]`"
},
"setPrefixIdentical": {
	"text": "Prefix is already set to `%%PREFIX%%`"
},
"setPrefixTooLong": {
	"text": "Prefix cannot exceed %%MAXLENGTH%% characters."
},
"illegalSetPrefixCharacter": {
	"text": "Prefix cannot include the following characters: %%ILLEGALCHARACTERS%%"
},

//Unknown
"unknownError": "An unknown error occured.",

//Send one of the above messages with replacements
//ex. replies.use(message, 'invalidRemoveSyntax', {'%%PREFIX%%': '$'});
use(message, reply, replacements){
	replacements = replacements || {};
	message.channel.sendMessage(util.multiReplace(this[reply][message.channel.type], replacements));
}

}

module.exports = replies;