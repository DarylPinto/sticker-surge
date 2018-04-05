module.exports = {
	
	/**
	* Gets an object with specific properties omitted
	*
	* @param {Object} obj - Base object
	* @param {Arary} propArr - Array of properties to omit 
	*
	* @returns {Object} - Cloned object `obj` without any properties in `propArr`
	*/
	removeProps(obj, propArr){
		let clone = Object.assign({}, obj);
		propArr.forEach(prop => {
			delete clone[prop];
		});
		return clone;
	},

	/**
	* Gets an object with specific properties
	*
	* @param {Object} obj - Base object
	* @param {Arary} propArr - Array of properties to include 
	*
	* @returns {Object} - Object with only properties from `propArr`
	*/
	withProps(obj, propArr){
		let clone = {}; 
		propArr.forEach(prop => {
			clone[prop] = obj[prop];
		});
		return clone;
	},

	/**
	* Determines if string contains emoji
	* Snippet taken from Lodash library
	*
	* @returns {Boolean}
	*/
	strHasEmoji(str){
		let emoji_regex = new RegExp('(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?(?:\u200d(?:[^\ud800-\udfff]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?)*', 'g');
		return emoji_regex.test(str);
	},

	/**
	* Check if user is sticker manager
	*
	* First, we check if guild's stickerManagerIds includes user's id
	* If stickerManagerRole is set to @everyone, then there's no stickerManagerIds,
	* in this case we have to make sure that either:
	* A) the command came from the bot, and therefore the user is guaranteed to be in the guild
	* B) the command came from the user, and the user's guilds includes the current guild id
	*
	* @param {Guild (mongo document)} Guild
	* @param {req, res} default express req, res
	* @returns {Boolean} User is a sticker manager
	*/
	userIsStickerManager(guild, req, res){

		if(guild.stickerManagerIds.includes(res.locals.userId)) return true;

		if(guild.stickerManagerRole === '@everyone'){
			if(!req.session.guilds) return true;
			if(req.session.guilds.includes(guild.id)) return true;
		}

		return false;
	},

	/**
	* Check if user is guild manager 
	*
	* @param {Guild (mongo document)} Guild
	* @param {req, res} default express req, res
	* @returns {Boolean} User is a guild manager
	*/
	userIsGuildManager(guild, req, res){
		return guild.guildManagerIds.includes(res.locals.userId);
	},

	/**
	* Check if each object in objArr has all properties in propNameArr
	* 
	* @param {objArr} Array of objects to test
	* @param {propNameArr} Array of property names (Strings) to test against
	* @returns {Boolean} True if all objects have all property names
	*/
	objArrHasProps(objArr, propNameArr){
		let ret = true;
		objArr.forEach(obj => {
			propNameArr.forEach(propName => {
				if(!obj.hasOwnProperty(propName)) ret = false;
			});
		});
		return ret;
	}
	
}