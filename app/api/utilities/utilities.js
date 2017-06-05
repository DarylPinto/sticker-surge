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
	}
	
}