module.exports = {
	
	//Get object `obj` without properties in `propArr`
	removeProps(obj, propArr){
		let clone = Object.assign({}, obj);
		propArr.forEach(prop => {
			delete clone[prop];
		});
		return clone;
	},
}