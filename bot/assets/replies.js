const util = require('./utility-functions');

let replies = {

//Permissions
"insufficientPermission": {
	"text":	"You need to have the role `%%ROLE%%` to do that. However, you can manage your own stickers (which are usable on any server) by private messaging me."
},

//Add sticker
"addSticker": {
	"text": "`:%%STICKERNAME%%:` sticker created. It can be used on this server by anyone.",
	"dm": "`:-%%STICKERNAME%%:` sticker created. Only you can use this sticker, but you can use it on any server that I'm on. (Note the dash preceding the name.)"
},
"invalidAddSyntax": {
	"text": "Invalid syntax. Use: `%%PREFIX%%createsticker [NAME] [IMAGE URL]` or upload an image with the comment `%%PREFIX%%createsticker [NAME]`",
	"dm": "Invalid syntax. Use: `createsticker [NAME] [IMAGE URL]` or upload an image with the comment `createsticker [NAME]`"
},
"illegalAddCharacters": {
	"text": "Invalid syntax. Sticker name must consist of letters and numbers only.",
	"dm": "Invalid syntax. Sticker name must consist of letters and numbers only."
},
"addNameConflictsEmojis": {
	"text": "Sticker name already in use by an emoji: :%%EMOJI%%:",
	"dm": "Sticker name already in use by an emoji: :%%EMOJI%%:"
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
	"text": "Invalid syntax. Use: `%%PREFIX%%deletesticker [STICKER NAME]`",
	"dm": "Invalid syntax. Use: `deletesticker [STICKER NAME]`"
},
"removeStickerNotFound": {
	"text": "There is no sticker with that name on this server.",
	"dm": "None of your stickers have that name."
},

//Add sticker pack
"addStickerPack": {
	"text": "**%%PACKNAME%%** sticker pack has been added to this server.\nTo see the stickers in this pack, click here: http://discordstickers.io/sticker-packs/%%PACKKEY%%",
	"dm": "You can now use the **%%PACKNAME%%** sticker pack on any server.\nTo see the stickers in this pack, click here: http://discordstickers.io/sticker-packs/%%PACKKEY%%"
},
"invalidAddPackSyntax": {
	"text": "Invalid syntax. Use: `%%PREFIX%%addstickerpack [STICKER PACK KEY]`\nTo see all sticker packs, click here: http://discordstickers.io/sticker-packs",
	"dm": "Invalid syntax. Use: `addstickerpack [STICKER PACK KEY]`\nTo see all sticker packs, click here: http://discordstickers.io/sticker-packs"
},
"addPackAlreadyIncluded": {
	"text": "This server already has that sticker pack.",
	"dm": "You already have that sticker pack."
},
"addPackDoesntExist": {
	"text": "There is no sticker pack with the **%%PACKKEY%%** key.",
	"dm": "There is no sticker pack with the **%%PACKKEY%%** key."
},

//Remove sticker pack
"removeStickerPack": {
	"text": "**%%PACKNAME%%** sticker pack has been removed from this server.",
	"dm": "**%%PACKNAME%%** sticker pack removed."
},
"invalidRemovePackSyntax": {
	"text": "Invalid syntax. Use: `%%PREFIX%%removestickerpack [STICKER PACK KEY]`",
	"dm": "Invalid syntax. Use: `removestickerpack [STICKER PACK KEY]`"
},
"removePackNotIncluded": {
	"text": "This server doesn't have that sticker pack.",
	"dm": "You don't have that sticker pack."
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

\`%%PREFIX%%createsticker\` - Create a sticker for anyone on this server to use.

\`%%PREFIX%%deletesticker\` - Delete a sticker from this server.

\`%%PREFIX%%addstickerpack\` - Add a sticker pack for anyone on this server to use. (Find sticker packs here: http://discordstickers.io/sticker-packs)

\`%%PREFIX%%removestickerpack\` - Remove a sticker pack from this server. 

\`%%PREFIX%%setprefix\` - Set the prefix used to trigger these commands.

\`%%PREFIX%%setrole\` - Set the role required to modify stickers on this server.`,

	//Direct Message help
	"dm": `\`stickers\` - View all your stickers.

\`createsticker\` - Create a sticker that you can use on any server.

\`deletesticker\` - Delete one of your stickers.

\`%%PREFIX%%addstickerpack\` - Add a sticker pack for you to use on any server. (Find sticker packs here: http://discordstickers.io/sticker-packs)

\`%%PREFIX%%removestickerpack\` - Remove a sticker pack.`

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
	"text": "Updated. Now commands must begin with `%%NEWPREFIX%%` instead of `%%PREFIX%%`"
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