const router = require('express').Router();
const path = require('path');
const rp = require('request-promise');
const verifyUserAjax = require('../middleware/verify-user.js')({ajax: true});
const verifyBot = require('../middleware/verify-bot.js');
const setGuildsCookie = require('../middleware/set-guilds-cookie.js');
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
	if(err)	res.status(400).send(err.message)
	else next();
}

const removedFields = {
	'_id': false,
	'__v': false,
	'customStickers._id': false
}

/**
* Check if user is authorized
*
* First, we check if guild's managerIds includes user's id
* If managerRole is set to @everyone, then there's no managerIds,
* in this case we have to make sure that either:
* A) the command came from the bot, and therefore the user is guaranteed to be in the guild
* B) the command came from the user, and the user's guilds includes the current guild id
*/
function userIsAuthorized(guild, req, res){
	if(guild.managerIds.includes(res.locals.userId)) return true;

	if(guild.managerRole === '@everyone'){
		if(!req.session.guilds) return true;
		if(req.session.guilds.includes(guild.id)) return true;
	}

	return false;
}

///////
//GET//
///////

//GET guild by id
router.get('/:id', (req, res) => {
	Guild.findOne({id: req.params.id}, removedFields)
	.then(guild => {	
		if(!guild || !guild.isActive) return res.status(404).send('Guild not found');
		res.json(util.removeProps(guild._doc, ['isActive']));	
	})
	.catch(err => res.status(503).send('Database error'));
});

//GET guild's stickers
router.get('/:id/stickers', (req, res) => {
	Guild.findOne({id: req.params.id}, removedFields)
	.then(guild => {	
		if(!guild || !guild.isActive) return res.status(404).send('Guild not found');
		res.json(guild.customStickers);	
	})
	.catch(err => res.status(503).send('Database error'));
});

//GET a guild's custom sticker
router.get('/:id/stickers/:stickername', (req, res) => {
	Guild.findOne({id: req.params.id}, removedFields)
	.then(guild => {
		if(!guild || !guild.isActive) return res.status(404).send('Guild not found');
		let sticker = guild._doc.customStickers.find(s => s.name === req.params.stickername);

		if(!sticker) return res.status(404).send('Guild does not have a custom sticker with that name');
		return res.json(sticker);
	})
	.catch(err => res.status(503).send('Database error'));
});

////////
//POST//
////////

//POST new guild

/*TODO: Check for bot authentication*/
router.post('/', verifyBot, (req, res) => {
	if(!req.body.guildName || !req.body.id) return res.status(400).send('Invalid body data');

	new Guild(req.body).save()
	.then(() => Guild.findOne({id: req.body.id}, removedFields))
	.then(guild => res.status(201).json(guild))
	.catch(err => res.status(503).send('Database error'));
});

//POST new custom sticker to existing guild
router.post('/:id/stickers', verifyUserAjax, upload.single('sticker'), handleMulterError, (req, res) => {

	if(!req.body.name || (!req.body.url && !req.file)) return res.status(400).send('Invalid body data');
	if(!req.body.name.match(/^:?-?[a-z0-9]+:?$/g)) return res.status(400).send('Sticker name must contain lowercase letters and numbers only');
	if(emojis.includes(req.body.name)) return res.status(400).send('Sticker name already in use by an emoji');
	if(!res.locals.userId) return res.status(401).send('Unauthorized');

	let data = {
		name: req.body.name.toLowerCase().replace(/(:|-)/g, ''),
		sticker_path: (req.file) ? path.join(__dirname+'/../', req.file.path) : req.body.url
	}	

	let imageIsLocal = (req.file) ? true : false;

	Guild.findOne({id: req.params.id})
	.then(guild => {
		if(!guild) return res.status(404).send('Guild not found');

		if(!userIsAuthorized(guild, req, res)){
			res.status(401).send('Unauthorized');
			return null;
		}
		if(guild.customStickers.map(s => s.name).includes(data.name)){
			res.status(400).send('Guild already has a custom sticker with that name');
			return null;
		}
		return Promise.all([guild, imageToCdn(data.sticker_path, imageIsLocal)]);
	})
	.then(arr => {
		if(!arr) return false;

		let guild = arr[0];
		let sticker = {name: data.name, url: arr[1]};

		guild.customStickers.unshift(sticker);
		return guild.save();
	})
	.then(guild => {
		if(!guild) return false;
		let sticker = guild.customStickers.find(s => s.name === data.name);
		return res.status(201).json(util.removeProps(sticker._doc, ['_id']));
	})
	.catch(err => {
		if(err.message.includes('Unauthorized')) return res.status(401).send('Unauthorized');
		console.error(err);
		res.status(503).send('Database error');
	});

});

/////////
//PATCH//
/////////

//Update guild

/*TODO: Check for bot authentication*/
router.patch('/:id', verifyBot, (req, res) => {

	Guild.findOne({id: req.params.id})
	.then(guild => {

		if(!guild){
			res.status(404).send('Guild not found');
			return null;	
		}

		Object.assign(guild, req.body);
		return guild.save();

	})
	.then(guild => {
		if(guild) res.send('Successfully updated guild');
	})
	.catch(err => {	
		res.status(503).send('Database error');
	});

});

//////////
//DELETE//
//////////

//DELETE existing user's custom sticker
router.delete('/:id/stickers/:stickername', verifyUserAjax, (req, res) => {	

	if(!res.locals.userId) return res.status(401).send('Unauthorized');

	Guild.findOne({id: req.params.id})
	.then(guild => {
		if(!guild || !guild.isActive){
			res.status(404).send('Guild not found');
			return null;
		}
			
		if(!userIsAuthorized(guild, req, res)){	
			res.status(401).send('Unauthorized');
			return null;
		}

		let sticker_names = guild.customStickers.map(s => s.name);
		let deletion_request_index = sticker_names.indexOf(req.params.stickername);
		if(deletion_request_index === -1){
			res.status(404).send('Guild does not have a custom sticker with that name');
			return null;
		}
		guild.customStickers.splice(deletion_request_index, 1);
		return guild.save();

	})
	.then(guild => {

		if(guild) res.send('Successfully deleted custom sticker');

	})
	.catch(err => {

		if(err.message.includes('Unauthorized')) return res.status(401).send('Unauthorized');	
		res.status(503).send('Database error');

	});

});

module.exports = router;