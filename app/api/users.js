const router = require('express').Router();
const rp = require('request-promise');
const User = require('./models/user-model.js');
const util = require('./utilities/utilities.js');
const emojis = require('./utilities/emojis.json');

const removedFields = {
	'_id': false,
	'__v': false,
	'refresh_token': false,
	'customStickers._id': false
}

///////
//GET//
///////

//GET user by id
router.get('/:id', (req, res) => {
	User.findOne({id: req.params.id}, removedFields)
	.then(user => {	
		if(!user) return res.status(404).send('User not found');
		res.json(user);	
	})
	.catch(err => res.status(503).send('Database error'));
});

//GET user's stickers
router.get('/:id/stickers', (req, res) => {
	User.findOne({id: req.params.id}, removedFields)
	.then(user => {	
		if(!user) return res.status(404).send('User not found');
		res.json(user.customStickers);	
	})
	.catch(err => res.status(503).send('Database error'));
});

//GET a user's custom sticker
router.get('/:id/stickers/:stickername', (req, res) => {
	User.findOne({id: req.params.id}, removedFields)
	.then(user => {
		if(!user) return res.status(404).send('User does not have a custom sticker with that name');
		let sticker = user._doc.customStickers.find(s => s.name === req.params.stickername);
		return res.json(sticker);	
	})
	.catch(err => res.status(503).send('Database error'));
});

////////
//POST//
////////

//POST new user
router.post('/', (req, res) => {
	if(!req.body.username || !req.body.id) return res.status(400).send('Invalid body data');	

	new User(req.body).save()
	.then(() => User.findOne({id: req.body.id}, removedFields))
	.then(user => res.status(201).json(user))
	.catch(err => res.status(503).send('Database error'));
});

//POST new custom sticker to existing user
router.post('/:id/stickers', (req, res) => {

	if(!req.body.name || !req.body.url) return res.status(400).send('Invalid body data');
	if(!req.body.name.match(/^[a-z0-9]+$/g)) return res.status(400).send('Sticker name must contain lowercase letters and numbers only');
	if(emojis.includes(req.body.name)) return res.status(400).send('Sticker name already in use by an emoji');

	req.body.name = req.body.name.toLowerCase();

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

		if(user.customStickers.map(s => s.name).includes(req.body.name)){
			res.status(400).send('User already has a custom sticker with that name');
			return null;
		}	
		user.customStickers.unshift(req.body);
		return user.save();

	})	
	.then(user => {

		if(!user) return false;
		let sticker = user.customStickers.find(s => s.name === req.body.name);
		return res.status(201).json(util.removeProps(sticker._doc, ['_id']));

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
		return User.findOne({id: req.params.id});

	})
	.then(user => {
		
		if(!user){
			res.status(404).send('User not found');
			return null;
		}

		let sticker_names = user.customStickers.map(s => s.name);
		let deletion_request_index = sticker_names.indexOf(req.params.stickername);
		if(deletion_request_index === -1){
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
		res.status(503).send('Database error');

	});

});

module.exports = router;