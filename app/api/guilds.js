const router = require('express').Router();
const path = require('path');
const rp = require('request-promise');
const verifyUserAjax = require('../middleware/verify-user.js')({ajax: true});
const verifyBot = require('../middleware/verify-bot.js');
const setGuildsCookie = require('../middleware/set-guilds-cookie.js');
const Guild = require('./models/guild-model.js');
const StickerPack = require('./models/sticker-pack-model.js');
const util = require('./utilities/utilities.js');
const imageToCdn = require('./utilities/image-to-cdn.js');
const deleteCdnImage = require('./utilities/delete-cdn-image.js');
const emojis = require('./utilities/emojis.json');
const multer = require('multer');

let storage = multer.memoryStorage();
let upload = multer({
	storage: storage,
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
	.catch(err => res.status(500).send('Internal server error'));
});

//GET guild's stickers
router.get('/:id/stickers', (req, res) => {
	Guild.findOne({id: req.params.id}, removedFields)
	.then(guild => {	
		if(!guild || !guild.isActive) return res.status(404).send('Guild not found');
		res.json(guild.customStickers);	
	})
	.catch(err => res.status(500).send('Internal server error'));
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
	.catch(err => res.status(500).send('Internal server error'));
});

////////
//POST//
////////

//POST new guild
router.post('/', verifyBot, (req, res) => {
	if(!req.body.guildName || !req.body.id) return res.status(400).send('Invalid body data');

	new Guild(req.body).save()
	.then(() => Guild.findOne({id: req.body.id}, removedFields))
	.then(guild => res.status(201).json(guild))
	.catch(err => res.status(500).send('Internal server error'));
});

//POST new custom sticker to existing guild
router.post('/:id/stickers', verifyUserAjax, upload.single('sticker'), handleMulterError, (req, res) => {

	if(!req.body.name || (!req.body.url && !req.file)) return res.status(400).send('Invalid body data');
	if(!req.body.name.match(/^:?-?[a-z0-9]+:?$/g)) return res.status(400).send('Sticker name must contain lowercase letters and numbers only');
	if(req.body.name.length > 20) return res.status(400).send('Sticker name cannot be longer than 20 characters');
	if(emojis.includes(req.body.name)) return res.status(400).send('Sticker name already in use by an emoji');
	if(!res.locals.userId) return res.status(401).send('Unauthorized');

	let data = {
		image: (req.file) ? req.file.buffer : req.body.url,
		name: req.body.name.toLowerCase().replace(/(:|-)/g, ''),
		createdVia: (req.file) ? 'website' : 'discord',
		groupId: req.params.id,
		creatorId: res.locals.userId
	}	

	let imageIsLocal = (req.file) ? true : false;

	Guild.findOne({id: req.params.id})
	.then(guild => {
		if(!guild) return res.status(404).send('Guild not found');

		if(!util.userIsGuildManager(guild, req, res) && !util.userIsStickerManager(guild, req, res)){
			res.status(401).send('Unauthorized');
			return null;
		}
		if(guild.customStickers.map(s => s.name).includes(data.name)){
			res.status(400).send('Guild already has a custom sticker with that name');
			return null;
		}
		if(guild.customStickers.length >= 400){
			res.status(403).send('Guild has reached maximum amount of custom stickers (400)');
			return null;
		}
		return Promise.all([
			guild,
			imageToCdn(data.image, `${guild.id}-${(new Date()).getTime()}-${data.name}`)
		]);
	})
	.then(arr => {
		if(!arr) return false;

		let guild = arr[0];
		let sticker = data;
		sticker.url = arr[1];

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
		res.status(500).send('Internal server error');
	});

});

//Increment `uses` property on a sticker
router.post('/:id/stickers/:stickername/uses', verifyBot, (req, res) => {

	Guild.findOne({id: req.params.id})
	.then(guild => {

		if(!guild) return res.status(404).send('Guild not found');
		let sticker = guild._doc.customStickers.find(s => s.name === req.params.stickername);

		if(!sticker) return res.status(404).send('Guild does not have a custom sticker with that name');

		sticker.uses += 1;
		guild.save();

		return res.json(sticker);	

	});

});

/////////
//PATCH//
/////////

//Update guild (bot only)
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
		if(guild) res.json(guild);
	})
	.catch(err => {	
		res.status(500).send('Internal server error');
	});

});

//Update guild prefix specifically (bot or auth'd user)
router.patch('/:id/command-prefix', verifyUserAjax, (req, res) => {

	if(!res.locals.userId) return res.status(401).send('Unauthorized');

	Guild.findOne({id: req.params.id})
	.then(guild => {

		if(!guild){
			res.status(404).send('Guild not found');
			return null;	
		}

		if(!util.userIsGuildManager(guild, req, res)){
			res.status(401).send('Unauthorized');
			return null;
		}

		if(/(@|#|-)/g.test(req.body.commandPrefix) || util.strHasEmoji(req.body.commandPrefix)){
			res.status(400).send('Illegal prefix');
			return null;
		}

		if(req.body.commandPrefix.length > 3){
			res.status(400).send('Prefix cannot be longer than 3 characters');
			return null;
		}

		guild.commandPrefix = req.body.commandPrefix;
		return guild.save();

	})
	.then(guild => {
		if(guild) res.json(guild);
	})
	.catch(err => {	
		res.status(500).send('Internal server error');
	});

});

//Update guild stickerManagerRole specifically (bot or auth'd user)
router.patch('/:id/sticker-manager-role', verifyUserAjax, (req, res) => {

	if(!res.locals.userId) return res.status(401).send('Unauthorized');

	Guild.findOne({id: req.params.id})
	.then(guild => {

		if(!guild){
			res.status(404).send('Guild not found');
			return null;	
		}

		if(!util.userIsGuildManager(guild, req, res)){
			res.status(401).send('Unauthorized');
			return null;
		}

		if(req.body.stickerManagerRole.length > 30){
			res.status(400).send('Role must be less than 30 characters');
			return null;
		}

		guild.stickerManagerRole = req.body.stickerManagerRole;
		return guild.save();

	})
	.then(guild => {
		if(guild) res.json(guild);
	})
	.catch(err => {	
		res.status(500).send('Internal server error');
	});

});

//Subscribe to a sticker pack
router.post('/:id/sticker-packs', verifyUserAjax, async (req, res) => {

	if(!req.body.packKey) return res.status(400).send('Invalid body data');
	if(!res.locals.userId) return res.status(401).send('Unauthorized');

	try{

		let guild = await Guild.findOne({id: req.params.id});
		let pack = await StickerPack.findOne({key: req.body.packKey});

		if(!util.userIsGuildManager(guild, req, res) && !util.userIsStickerManager(guild, req, res)){
			res.status(401).send('Unauthorized');
			return null;
		}

		if(!guild) return res.status(404).send('Guild not found');
		if(!pack) return res.status(404).send('Sticker Pack not found');
		
		if(!guild.stickerPacks.includes(req.body.packKey)){
			guild.stickerPacks.push(req.body.packKey);
			pack.subscribers += 1;
		}else{
			return res.status(400).send('Guild already has that Sticker Pack');
		}

		await guild.save();
		pack.save(); //async
		return res.status(201).json(guild.stickerPacks);

	}catch(err){
		console.error("Error updating stickerpacks for guild\n", err.message);
		return res.status(500).send('Internal server error');
	}

});

//////////
//DELETE//
//////////

//DELETE existing guild's custom sticker
router.delete('/:id/stickers/:stickername', verifyUserAjax, (req, res) => {	

	if(!res.locals.userId) return res.status(401).send('Unauthorized');

	Guild.findOne({id: req.params.id})
	.then(guild => {
		if(!guild || !guild.isActive){
			res.status(404).send('Guild not found');
			return null;
		}

		let sticker_names = guild.customStickers.map(s => s.name);
		let deletion_request_index = sticker_names.indexOf(req.params.stickername);
		if(deletion_request_index === -1){
			res.status(404).send('Guild does not have a custom sticker with that name');
			return null;
		}

		let sticker = guild.customStickers[deletion_request_index];

		//Users can only delete stickers they created
		//Exception to the rule: Guild managers can delete any sticker
		if(!util.userIsGuildManager(guild, req, res) && (res.locals.userId != sticker.creatorId)){
			res.status(401).send('Unauthorized');
			return null;
		}

		deleteCdnImage(sticker.url);
		guild.customStickers.splice(deletion_request_index, 1);
		return guild.save();

	})
	.then(guild => {

		if(guild) res.send('Successfully deleted custom sticker');

	})
	.catch(err => {

		if(err.message.includes('Unauthorized')) return res.status(401).send('Unauthorized');	
		res.status(500).send('Internal server error');

	});

});

//Unsubscribe from a sticker pack
router.delete('/:id/sticker-packs', verifyUserAjax, async (req, res) => {

	if(!req.body.packKey) return res.status(400).send('Invalid body data');
	if(!res.locals.userId) return res.status(401).send('Unauthorized');	

	try{

		let guild = await Guild.findOne({id: req.params.id});
		let pack = await StickerPack.findOne({key: req.body.packKey});	

		if(!util.userIsGuildManager(guild, req, res) && !util.userIsStickerManager(guild, req, res)){
			res.status(401).send('Unauthorized');
			return null;
		}

		if(!guild) return res.status(404).send('Guild not found');
		if(!guild.stickerPacks.includes(req.body.packKey)){
			return res.status(400).send('Guild does not have a Sticker Pack with that key');
		}

		let deletion_request_index = guild.stickerPacks.indexOf(req.body.packKey);	
		guild.stickerPacks.splice(deletion_request_index, 1);
		pack.subscribers -= 1;
		if(pack.subscribers < 0) pack.subscribers = 0;

		await guild.save();
		pack.save(); //async
		return res.json(guild.stickerPacks);

	}catch(err){
		console.error("Error updating stickerpacks for guild\n", err.message);
		return res.status(500).send('Internal server error');
	}

});

module.exports = router;