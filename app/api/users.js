const router = require('express').Router();
const User = require('./models/user-model.js');
const util = require('./utilities.js');

///////
//GET//
///////

//GET user by id
router.get('/:id', (req, res) => {
	User.findOne({id: req.params.id})
	.then(user => {
		if(user){
			let data = util.removeProps(user._doc, ['_id', '__v']);
			data.customStickers = data.customStickers.map(s => util.removeProps(s._doc, ['_id']));
			res.json(data);
		}else{
			res.json({status: 404, message: 'User not found'});
		}
	})
	.catch(err => res.json({status: 503, message: 'Database error'}));
});


////////
//POST//
////////

//POST new user
router.post('/', (req, res) => {
	let user = new User(req.body);

	user.save()
	.then(() => res.json({
		status: 201,
		resource: util.removeProps(user._doc, ['_id', '__v'])
	}))
	.catch(err => res.json({status: 503, message: 'Database error'}));
});

//POST new custom sticker to existing user
router.post('/:id/stickers', (req, res) => {

	if(!req.body.name.match(/^[a-z0-9]+$/g)){
		return res.json({status: 400, message: 'Sticker name must contain lowercase letters and numbers only'});
	}

	User.findOne({id: req.params.id})
	.then(user => {
		if(user.customStickers.map(s => s.name).includes(req.body.name)){
			res.json({status: 400, message: `User already has a custom sticker named: ${req.body.name}`});
			return null;
		}
		user.customStickers.unshift(req.body);
		return user.save();
	})	
	.then(user => {
		if(!user) return false;
		let data = util.removeProps(user._doc, ['_id', '__v']);
		data.customStickers = data.customStickers.map(s => util.removeProps(s._doc, ['_id']));
		res.json(data);
	})
	.catch(err => res.json({status: 503, message: 'Database error'}));

});

//////////
//DELETE//
//////////

//DELETE existing user's custom sticker
router.delete('/:id/stickers', (req, res) => {
	
	User.findOne({id: req.params.id})
	.then(user => {
		let sticker_names = user.customStickers.map(s => s.name);
		let deletion_request_index = sticker_names.indexOf(req.body.name);
		if(deletion_request_index === -1){
			res.json({status: 400, message: `User does not have a custom sticker named: ${req.body.name}`});
			return null;
		}

		user.customStickers.splice(deletion_request_index, 1);
		return user.save();
	})	
	.then(user => {
		if(user) res.json({status: 204, message: `Successfully deleted custom sticker: ${req.body.name}`})
	})
	.catch(err => res.json({status: 503, message: 'Database error'}));

});

module.exports = router;