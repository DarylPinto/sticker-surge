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
	}
	
}