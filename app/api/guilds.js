const router = require('express').Router();
const path = require('path');
const rp = require('request-promise');
const verifyUserAjax = require('../middleware/verify-user.js')({ajax: true});
const Guild = require('./models/guild-model.js');
const util = require('./utilities/utilities.js');
const imageToCdn = require('./utilities/image-to-cdn.js');
const emojis = require('./utilities/emojis.json');

let multer = require('multer');
let upload = multer({
	dest: './sticker-temp/',
	limits: {fileSize: 5 * 1024 * 1024} //5MB max image upload
});
let handleMulterError = function(err, req, res, next){
	if(err)	res.status(400).send(err.message);
	else next();
}

const removedFields = {
	'_id': false,
	'__v': false,	
	'customStickers._id': false
}

///////
//GET//
///////

//GET guild by id
router.get('/:id', (req, res) => {
	Guild.findOne({id: req.params.id}, removedFields)
	.then(guild => {	
		if(!guild) return res.status(404).send('Guild not found');
		res.json(guild);	
	})
	.catch(err => res.status(503).send('Database error'));
});

//GET guild's stickers
router.get('/:id/stickers', (req, res) => {
	Guild.findOne({id: req.params.id}, removedFields)
	.then(guild => {	
		if(!guild) return res.status(404).send('Guild not found');
		res.json(guild.customStickers);	
	})
	.catch(err => res.status(503).send('Database error'));
});

//GET a guild's custom sticker
router.get('/:id/stickers/:stickername', (req, res) => {
	Guild.findOne({id: req.params.id}, removedFields)
	.then(guild => {
		if(!guild) return res.status(404).send('Guild does not have a custom sticker with that name');
		let sticker = guild._doc.customStickers.find(s => s.name === req.params.stickername);
		return res.json(sticker);
	})
	.catch(err => res.status(503).send('Database error'));
});

////////
//POST//
////////

//POST new guild

/*TODO: Check for user/bot authentication*/
router.post('/', (req, res) => {
	if(!req.body.guildName || !req.body.id) return res.status(400).send('Invalid body data');	

	new Guild(req.body).save()
	.then(() => Guild.findOne({id: req.body.id}, removedFields))
	.then(guild => res.status(201).json(guild))
	.catch(err => res.status(503).send('Database error'));
});

//POST new custom sticker to existing user
router.post('/:id/stickers', verifyUserAjax, upload.single('sticker'), handleMulterError, (req, res) => {

	if(!req.body.name || (!req.body.url && !req.file)) return res.status(400).send('Invalid body data');
	if(!req.body.name.match(/^:?-?[a-z0-9]+:?$/g)) return res.status(400).send('Sticker name must contain lowercase letters and numbers only');
	if(emojis.includes(req.body.name)) return res.status(400).send('Sticker name already in use by an emoji');
	if(req.session.id != req.params.id) return res.status(401).send('Unauthorized');

	let data = {
		name: req.body.name.toLowerCase().replace(/(:|-)/g, ''),
		sticker_path: (req.file) ? path.join(__dirname+'/../', req.file.path) : req.body.url
	}	

	let imageIsLocal = (req.file) ? true : false;

	User.findOne({id: req.params.id})
	.then(user => {
		if(user.customStickers.map(s => s.name).includes(data.name)){
			res.status(400).send('User already has a custom sticker with that name');
			return null;
		}
		return Promise.all([user, imageToCdn(data.sticker_path, imageIsLocal)]);
	})
	.then(arr => {
		if(!arr) return false;

		let user = arr[0];
		let sticker = {name: data.name, url: arr[1]};

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
		res.status(503).send('Database error');
	});

});

//////////
//DELETE//
//////////

//DELETE existing user's custom sticker
router.delete('/:id/stickers/:stickername', verifyUserAjax, (req, res) => {

	if(req.session.id != req.params.id) return res.status(401).send('Unauthorized');

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