module.exports = {
	
	//Get object `obj` without properties in `propArr`
	removeProps(obj, propArr){
		let clone = Object.assign({}, obj);
		propArr.forEach(prop => {
			delete clone[prop];
		});
		return clone;
	},

	//Get object `obj` with only the properties in `propArr`
	withProps(obj, propArr){
		let clone = {}; 
		propArr.forEach(prop => {
			clone[prop] = obj[prop];
		});
		return clone;
	}
	
}