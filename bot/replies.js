const util = require('./utility-functions');

let replies = {

//Permissions
"insufficientPermission": "You need to have the role **%%ROLE%%** to do that. However, you can manage your own stickers (which are usable on any server) by private messaging me.",

//Add sticker
"invalidAddSyntax": "Invalid syntax. Use: `%%PREFIX%%addsticker [NAME] [IMAGE URL]` or upload an image with the comment `%%PREFIX%%addsticker [NAME]`",
"addPersonalSticker": "`:-%%STICKERNAME%%:` sticker created. Only you can use this sticker, but you can use it on any server that I'm on. (Note the dash preceding the name.)",
"addGroupSticker": "`:%%STICKERNAME%%:` sticker created. It can be used on this server by anyone.",
"stickerAlreadyExists": "A sticker with that name already exists.",

//Remove sticker	
"invalidRemoveSyntax": "Invalid syntax. Use: `%%PREFIX%%removesticker [STICKER NAME]`",
"removePersonalSticker": "`:-%%STICKERNAME%%:` sticker removed.",
"removeGroupSticker": "`:%%STICKERNAME%%:` sticker removed.",
"removeGroupStickerNotFound": "There is no sticker with that name on this server.",
"removePersonalStickerNotFound": "None of your stickers have that name.",

//Sticker info
"personalStickerInfo": "To see all your personal stickers, click here: http://discordstickers.io/user/%%BASE62USERID%%",
"groupStickerInfo": "For a full list of stickers available on this server, click here: http://discordstickers.io/server/%%BASE62GUILDID%%\nThe most recently sent stickers were: %%RECENTSTICKERS%%",

//Sticker help
"groupHelp": `\`%%PREFIX%%stickers\` - View all the stickers on this server, and the names of the 3 most recently used ones.

\`%%PREFIX%%addsticker\` - Add a sticker for anyone on this server to use.

\`%%PREFIX%%removesticker\` - Remove a sticker from this server.

\`%%PREFIX%%setprefix\` - Set the prefix used to trigger these commands.

\`%%PREFIX%%setrole\` - Set the role required to modify stickers on this server.`,

"personalHelp": `(Note: None of the following commands use prefixes)

\`%%PREFIX%%stickers\` - View all your stickers.

\`%%PREFIX%%addsticker\` - Add a sticker that you can use on any server.

\`%%PREFIX%%removesticker\` - Remove one of your stickers.`,

//Set Role
"setRole": `Updated. Now only users with the role **%%NEWROLE%%** can manage this server's stickers!`,
"setRoleEveryone": `Updated. Now everyone can manage this server's stickers!`,
"roleNameAlreadySet": "**%%ROLENAME%%** is already the role required to manage stickers on this server.",
"invalidSetRoleSyntax": "Invalid Syntax. Use: `%%PREFIX%%setrole [ROLE NAME]`",
"invalidRoleNameLength": "Role name cannot exceed %%MAXLENGTH%% characters.",

//Set Prefix
"setPrefix": "Updated. Now commands must begin with `%%NEWPREFIX%%` instead of `%%PREFIX%%`.",
"invalidSetPrefixSyntax": "Invalid Syntax. Use: `%%PREFIX%%setprefix [NEW PREFIX]`",
"prefixAlreadySet": "Prefix is already set to `%%PREFIX%%`",
"invalidSetPrefixLength": "Prefix cannot exceed %%MAXLENGTH%% characters.",
"invalidSetPrefixCharacter": "Prefix cannot include the following characters: %%ILLEGALCHARACTERS%%",

//Unknown
"unknownError": "An unknown error occured.",

//Return one of the above messages with replacements ex. replies.use('invalidRemoveSyntax', {'%%PREFIX%%': '$'});
use(reply, replacements){
	replacements = replacements || {};
	return util.multiReplace(this[reply], replacements);
}

}

module.exports = replies;