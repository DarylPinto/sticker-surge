const router = require('express').Router();
const path = require('path');
const rp = require('request-promise');
const verifyUserAjax = require('../middleware/verify-user.js')({ajax: true});
const verifyBot = require('../middleware/verify-bot.js');
const User = require('./models/user-model.js');
const util = require('./utilities/utilities.js');
const imageToCdn = require('./utilities/image-to-cdn.js');
const deleteCdnImage = require('./utilities/delete-cdn-image.js');
const multer = require('multer');

let storage = multer.memoryStorage();
let upload = multer({
	storage: storage,
	limits: {fileSize: 5 * 1024 * 1024} //5MB max image upload
});
let handleMulterError = function(err, req, res, next){
	if(err)	res.status(400).send(err.message);
	else next();
}

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
	.catch(err => res.status(500).send('Internal server error'));
});

//GET user's stickers
router.get('/:id/stickers', (req, res) => {
	User.findOne({id: req.params.id}, removedFields)
	.then(user => {	
		if(!user) return res.status(404).send('User not found');
		res.json(user.customStickers);	
	})
	.catch(err => res.status(500).send('Internal server error'));
});

//GET a user's custom sticker
router.get('/:id/stickers/:stickername', (req, res) => {
	User.findOne({id: req.params.id}, removedFields)
	.then(user => {
		if(!user) return res.status(404).send('User not found');
		let sticker = user._doc.customStickers.find(s => s.name === req.params.stickername);

		if(!sticker) return res.status(404).send('User does not have a custom sticker with that name');
		return res.json(sticker);	
	})
	.catch(err => res.status(500).send('Internal server error'));
});

////////
//POST//
////////

//POST new user
router.post('/', verifyBot, (req, res) => {
	
	if(!req.body.username || !req.body.id) return res.status(400).send('Invalid body data');	

	new User(req.body).save()
	.then(() => User.findOne({id: req.body.id}, removedFields))
	.then(user => res.status(201).json(user))
	.catch(err => res.status(500).send('Internal server error'));
});

//POST new custom sticker to existing user
router.post('/:id/stickers', verifyUserAjax, upload.single('sticker'), handleMulterError, (req, res) => {

	if(!req.body.name || (!req.body.url && !req.file)) return res.status(400).send('Invalid body data');
	if(!req.body.name.match(/^:?-?[a-z0-9]+:?$/g)) return res.status(400).send('Sticker name must contain lowercase letters and numbers only');
	if(req.body.name.length > 20) return res.status(400).send('Sticker name cannot be longer than 20 characters');
	if(res.locals.userId != req.params.id) return res.status(401).send('Unauthorized');

	let data = {
		image: (req.file) ? req.file.buffer : req.body.url,
		name: req.body.name.toLowerCase().replace(/(:|-)/g, ''),
		createdVia: (req.file) ? 'website' : 'discord',
		groupId: res.locals.userId,
		creatorId: res.locals.userId
	}	

	let imageIsLocal = (req.file) ? true : false;

	User.findOne({id: req.params.id})
	.then(user => {
		if(!user) return res.status(404).send('User not found');
		if(user.customStickers.map(s => s.name).includes(data.name)){
			res.status(400).send('User already has a custom sticker with that name');
			return null;
		}
		if(user.customStickers.length >= 200){
			res.status(403).send('User has reached maximum amount of custom stickers (200)');
			return null;
		}
		return Promise.all([
			user,
			imageToCdn(data.image, `${user.id}-${(new Date()).getTime()}-${data.name}`)
		]);
	})
	.then(arr => {
		if(!arr) return false;

		let user = arr[0];
		let sticker = data;
		sticker.url = arr[1];

		user.customStickers.unshift(sticker);
		return user.save();
	})
	.then(user => {
		if(!user) return false;
		let sticker = user.customStickers.find(s => s.name === data.name);
		return res.status(201).json(util.removeProps(sticker._doc, ['_id']));
	})
	.catch(err => {
		if(err.message.includes('Unauthorized')) return res.status(401).send('Unauthorized');
		console.log(err.message);
		res.status(500).send('Internal server error');
	});

});

//Increment `uses` property on a sticker
router.post('/:id/stickers/:stickername/uses', verifyBot, (req, res) => {

	User.findOne({id: req.params.id})
	.then(user => {

		if(!user) return res.status(404).send('User not found');
		let sticker = user._doc.customStickers.find(s => s.name === req.params.stickername);

		if(!sticker) return res.status(404).send('User does not have a custom sticker with that name');

		sticker.uses += 1;
		user.save();

		return res.json(sticker);	

	});

});

//////////
//DELETE//
//////////

//DELETE existing user's custom sticker
router.delete('/:id/stickers/:stickername', verifyUserAjax, (req, res) => {

	if(res.locals.userId != req.params.id) return res.status(401).send('Unauthorized');

	User.findOne({id: req.params.id})
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

		deleteCdnImage(user.customStickers[deletion_request_index].url);
		user.customStickers.splice(deletion_request_index, 1);
		return user.save();

	})	
	.then(user => {

		if(user) res.send('Successfully deleted custom sticker');

	})
	.catch(err => {

		if(err.message.includes('Unauthorized')) return res.status(401).send('Unauthorized');	
		res.status(500).send('Internal server error');

	});

});

module.exports = router;