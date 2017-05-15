const router = require('express').Router();
const rp = require('request-promise');
const User = require('./models/user-model.js');
const util = require('./utilities/utilities.js');
const emojis = require('./utilities/emojis.json');

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
			res.status(404).send('User not found');
		}
	})
	.catch(err => res.status(503).send('Database error'));
});

//GET a user's custom sticker
router.get('/:id/stickers/:stickername', (req, res) => {
	User.findOne({id: req.params.id})
	.then(user => {
		if(user){
			let custom_stickers = user._doc.customStickers;
			let sticker = custom_stickers.find(s => s.name === req.params.stickername);
			res.json(util.removeProps(sticker._doc, ['_id']));
		}else{
			res.status(404).send('User does not have a custom sticker with that name');
		}
	})
	.catch(err => res.status(503).send('Database error'));
});

////////
//POST//
////////

//POST new user
router.post('/', (req, res) => {
	let user = new User(req.body);

	user.save()
	.then(() => res.status(201).json(util.removeProps(user._doc, ['_id', '__v'])))
	.catch(err => res.status(503).send('Database error'));
});

//POST new custom sticker to existing user
router.post('/:id/stickers', (req, res) => {

	if(!req.body.name.match(/^[a-z0-9]+$/g)) return res.status(400).send('Sticker name must contain lowercase letters and numbers only');
	if(emojis.includes(req.body.name)) return res.status(400).send('Sticker name already in use by an emoji');

	rp({
		method: 'GET',
		uri: 'https://discordapp.com/api/users/@me',
		headers: {
			'Authorization': `Bearer ${req.session.tok}`
		}
	})
	.then(data => {

		data = JSON.parse(data);
		if(data.id != req.params.id) return res.status(401).send('Unauthorized');
		return User.findOne({id: req.params.id})

	})
	.then(user => {

		if(!user){
			res.status(404).send('User not found');
			return null;
		}

		if(user.customStickers.map(s => s.name).includes(req.body.name)){
			res.status(400).send('User already has a custom sticker with that name');
			return null;
		}
		user.customStickers.unshift(req.body);
		return user.save();

	})	
	.then(user => {

		if(!user) return false;
		let data = util.removeProps(user._doc, ['_id', '__v']);
		data.customStickers = data.customStickers.map(s => util.removeProps(s._doc, ['_id']));
		return res.status(201).json(data);

	})
	.catch(err => {

		if(err.message.includes('Unauthorized')) return res.status(401).send('Unauthorized');
		res.status(503).send('Database error');

	});

});

//////////
//DELETE//
//////////

//DELETE existing user's custom sticker
router.delete('/:id/stickers/:stickername', (req, res) => {

	rp({
		method: 'GET',
		uri: 'https://discordapp.com/api/users/@me',
		headers: {
			'Authorization': `Bearer ${req.session.tok}`
		}
	})
	.then(data => {

		data = JSON.parse(data);
		if(data.id != req.params.id) return res.status(401).send('Unauthorized');
		return User.findOne({id: req.params.id})

	})
	.then(user => {
		
		if(!user){
			res.status(404).send('User not found');
			return null;
		}

		let sticker_names = user.customStickers.map(s => s.name);
		let deletion_request_index = sticker_names.indexOf(req.params.stickername);
		if(deletion_request_index === -1){
			console.log(sticker_names);	
			res.status(404).send('User does not have a custom sticker with that name');
			return null;
		}
		user.customStickers.splice(deletion_request_index, 1);
		return user.save();

	})	
	.then(user => {

		if(user) res.send('Successfully deleted custom sticker');

	})
	.catch(err => {

		if(err.message.includes('Unauthorized')) return res.status(401).send('Unauthorized');
		console.log(err.message);
		res.status(503).send('Database error');

	});

});

module.exports = router;