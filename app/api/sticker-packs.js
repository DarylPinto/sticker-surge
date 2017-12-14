const router = require('express').Router();
const path = require('path');
const rp = require('request-promise');
const verifyUserAjax = require('../middleware/verify-user.js')({ajax: true});
const verifyBot = require('../middleware/verify-bot.js');
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
	'__v': false
}

///////
//GET//
///////

//GET Sticker pack by key 
router.get('/:key', async (req, res) => {

	try{
		const pack = await StickerPack.findOne({key: req.params.key}, removedFields);
		if(!pack) return res.status(404).send('Sticker Pack not found');
		res.json(pack);
	}catch(err){
		res.status(500).send('Internal server error');
	}	

});

//GET Sticker Pack stickers
router.get('/:key/stickers', async (req, res) => {

	try{
		const pack = await StickerPack.findOne({key: req.params.key}, removedFields);
		if(!pack) return res.status(404).send('Sticker Pack not found');
		res.json(pack.stickers);
	}catch(err){
		res.status(500).send('Internal server error');
	}	

});

//GET a specific sticker from a Sticker Pack 
router.get('/:key/stickers/:stickername', async (req, res) => {

	try{
		const pack = await StickerPack.findOne({key: req.params.key}, removedFields);
		if(!pack) return res.status(404).send('Sticker Pack not found');
		const sticker = pack._doc.customStickers.find(s => s.name === req.params.stickername);
		if(!sticker) return res.status(404).send('Sticker Pack does not contain a custom sticker with that name');
		res.json(sticker);
	}catch(err){
		res.status(500).send('Internal server error');
	}	

});

////////
//POST//
////////

//POST new sticker pack
router.post('/', /*verifyUserAjax,*/ async (req, res) => {

	if(!req.body.name || !req.body.key || !req.body.creatorId) return res.status(400).send('Invalid body data');
	if(!req.body.key.match(/^[a-z0-9]+$/g)) return res.status(400).send('Sticker Pack key must contain lowercase letters and numbers only');
	if(!req.body.key.length > 6) return res.status(400).send('Sticker Pack key cannot be longer than 6 characters');
	if(!req.body.name.length > 60) return res.status(400).send('Sticker Pack name cannot be longer than 60 characters');
	//if(res.locals.userId != req.body.creatorId) return res.status(401).send('Unauthorized');

	try{
		await new StickerPack(req.body).save();
		const pack = await StickerPack.findOne({key: req.body.key}, removedFields);
		res.status(201).json(pack);
	}catch(err){
		res.status(500).send('Internal server error');
	}

});

//POST new sticker to sticker pack
router.post('/:key/stickers', /*verifyUserAjax,*/ upload.single('sticker'), handleMulterError, async (req, res) => {

	if(!req.body.name || (!req.body.url && !req.file)) return res.status(400).send('Invalid body data');
	if(!req.body.name.match(/^:?-?[a-z0-9]+:?$/g)) return res.status(400).send('Sticker name must contain lowercase letters and numbers only');
	if(req.body.name.length > 20) return res.status(400).send('Sticker name cannot be longer than 20 characters');	
	//if(!res.locals.userId) return res.status(401).send('Unauthorized');

	let data = {
		image: (req.file) ? req.file.buffer : req.body.url,
		name: req.body.name.toLowerCase().replace(/(:|-)/g, ''),
		createdVia: (req.file) ? 'website' : 'discord',
		groupId: req.params.key,
		//creatorId: res.locals.userId
	}	

	let imageIsLocal = (req.file) ? true : false;

	try{

		let pack = await StickerPack.findOne({key: req.params.key}, removedFields);
		if(!pack) return res.status(404).send('Sticker Pack not found');
		//if(res.locals.userId != pack.creatorId) return res.status(401).send('Unauthorized');
		if(pack.stickers.map(s => s.name).includes(data.name)) return res.status(400).send('Sticker Pack already has a custom sticker with that name');
		if(pack.stickers.length >= 400) return res.status(403).send('Sticker Pack has reached maximum amount of stickers (400)');

		//let cdn_url = await imageToCdn(data.image, `${pack.key}-${(new Date()).getTime()}-${data.name}`);
		let cdn_url = 'https://example.com';

		let sticker = data;
		sticker.url = cdn_url;
		pack.stickers.unshift(sticker);	
		let saved_pack = await pack.save(); //Error line
		
		sticker = saved_pack.stickers.find(s => s.name === data.name);
		return res.status(201).json(util.removeProps(sticker._doc, ['_id']));

	}catch(err){

		if(err.message.includes('Unauthorized')) return res.status(401).send('Unauthorized');
		console.error(err);
		res.status(500).send('Internal server error');

	}

});

module.exports = router;
