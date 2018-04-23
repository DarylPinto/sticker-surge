const router = require('express').Router();
const path = require('path');
const rp = require('request-promise');
const verifyUserAjax = require('../middleware/verify-user.js')({ajax: true});
const verifyBot = require('../middleware/verify-bot.js');
const StickerPack = require('./models/sticker-pack-model.js');
const Guild = require('./models/guild-model.js');
const User = require('./models/user-model.js');
const util = require('./utilities/utilities.js');
const imageToCdn = require('./utilities/image-to-cdn.js');
const deleteCdnImage = require('./utilities/delete-cdn-image.js');
const emojis = require('./utilities/emojis.json');
const multer = require('multer');
const covert = require('../../covert.js');

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
	'stickers._id': false
}

///////
//GET//
///////

router.get('/', async (req, res) =>{

	let packsPerPage = 8;

	//Page #
	let requestedPage = parseInt(req.query.page);
	let skipAmount = 0;

	if(!isNaN(requestedPage) && requestedPage !== 0){	
		skipAmount = (parseInt(req.query.page) - 1) * packsPerPage;
	}	

	//Sort Type
	let sortType;

	if(req.query.sort === 'popular') sortType = '-subscribers';
	else if(req.query.sort === 'oldest') sortType = 'createdAt';
	else sortType = '-createdAt';

	//Search
	let search = {};//{published: true};

	if(req.query.search){
		let s = decodeURIComponent(req.query.search).trim();
		let regex = new RegExp(s, 'i');
		search.$or = [{name: regex}, {key: regex}];
	}

	try{

		const packs = await StickerPack.find(search, removedFields).sort(sortType).skip(skipAmount).limit(packsPerPage);
		let packInfo = packs.map(p => p._doc);
		packInfo.forEach(p => delete p.stickers);
		return res.send(packInfo);

	}catch(err){
		console.log(err.message);
		return res.status(500).send('Internal server error');	
	}	

});

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

//GET Sticker Pack info (all data except stickers themselves)
router.get('/:key/info', async (req, res) => {

	try{
		const pack = await StickerPack.findOne({key: req.params.key}, removedFields);
		if(!pack) return res.status(404).send('Sticker Pack not found');
		delete pack._doc.stickers;
		res.json(pack._doc);
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
		const sticker = pack.stickers.find(s => s.name === req.params.stickername);
		if(!sticker) return res.status(404).send('Sticker Pack does not contain a sticker with that name');
		res.json(sticker);
	}catch(err){
		res.status(500).send('Internal server error');
	}	

});

////////
//POST//
////////

//POST new sticker pack
router.post('/', verifyUserAjax, upload.single('icon'), handleMulterError, async (req, res) => {	

	if(!req.body.name || !req.body.key) return res.status(400).send('Invalid body data');
	if(!req.body.key.match(/^[a-z0-9]+$/g)) return res.status(400).send('Sticker Pack key must contain lowercase letters and numbers only');
	if(req.body.key.length > 8) return res.status(400).send('Sticker Pack key cannot be longer than 8 characters');
	if(req.body.name.length > 60) return res.status(400).send('Sticker Pack name cannot be longer than 60 characters');
	if(!res.locals.userId) return res.status(401).send('Unauthorized');

	//Check if Sticker Pack key is already used
	const keyAlreadyUsed = await StickerPack.findOne({key: req.body.key});
	if(keyAlreadyUsed) return res.status(400).send('There is already a Sticker Pack with that key');	

	//Ensure user has voted on DBL within the last 24hrs before continuing (only works if DBL integrated)
	if(covert.discord_bot_list.integrated){	
		let dbl_vote_check = await rp({
			uri: `https://discordbots.org/api/bots/${covert.discord.app_id}/check?userId=${res.locals.userId}`,
			headers: {Authorization: covert.discord_bot_list.api_key},
			json: true
		});

		if(dbl_vote_check.voted === 0) return res.status(401).send('User has not voted on DBL today');
	}

	//Create Sticker Pack
	let data = Object.assign({}, req.body);
	data.creatorId = res.locals.userId;
	data.icon = await imageToCdn(req.file.buffer, `${data.key}-ICON-${(new Date()).getTime()}`);
	
	try{
		await new StickerPack(data).save();
		const pack = await StickerPack.findOne({key: req.body.key}, removedFields);
		res.status(201).json(pack);
	}catch(err){
		console.error(err);
		res.status(500).send('Internal server error');
	}

});

//POST new sticker to sticker pack
router.post('/:key/stickers', verifyUserAjax, upload.single('sticker'), handleMulterError, async (req, res) => {

	if(!req.body.name || (!req.body.url && !req.file)) return res.status(400).send('Invalid body data');
	if(!req.body.name.match(/^:?-?[a-z0-9]+:?$/g)) return res.status(400).send('Sticker name must contain lowercase letters and numbers only');
	if(req.body.name.length > 20) return res.status(400).send('Sticker name cannot be longer than 20 characters');	
	if(!res.locals.userId) return res.status(401).send('Unauthorized');

	let sticker = {
		image: (req.file) ? req.file.buffer : req.body.url,
		name: req.body.name.toLowerCase().replace(/(:|-)/g, ''),
		createdVia: (req.file) ? 'website' : 'discord',
		groupId: req.params.key,
		creatorId: res.locals.userId
	}

	let imageIsLocal = (req.file) ? true : false;

	try{

		let pack = await StickerPack.findOne({key: req.params.key});
		if(!pack) return res.status(404).send('Sticker Pack not found');
		if(res.locals.userId != pack.creatorId) return res.status(401).send('Unauthorized');
		if(pack.stickers.map(s => s.name).includes(sticker.name)) return res.status(400).send('Sticker Pack already has a sticker with that name');
		if(pack.stickers.length >= 400) return res.status(403).send('Sticker Pack has reached maximum amount of stickers (400)');

		sticker.url = await imageToCdn(sticker.image, `${pack.key}-${(new Date()).getTime()}-${sticker.name}`);

		pack.stickers.unshift(sticker);	
		pack = await pack.save();
		
		sticker = pack.stickers.find(s => s.name === sticker.name);
		return res.status(201).json(util.removeProps(sticker._doc, ['_id']));

	}catch(err){

		if(err.message.includes('Unauthorized')) return res.status(401).send('Unauthorized');
		console.error(err);
		res.status(500).send('Internal server error');

	}

});

//Increment `uses` property on a sticker
router.post('/:key/stickers/:stickername/uses', /*verifyBot,*/ async (req, res) => {

	let pack = await StickerPack.findOne({key: req.params.key});
	if(!pack) return res.status(404).send('Sticker Pack not found');
	let sticker = pack._doc.stickers.find(s => s.name === req.params.stickername);
	if(!sticker) return res.status(404).send('Sticker Pack does not have a sticker with that name');

	sticker.uses += 1;
	pack.save();

	return res.json(util.removeProps(sticker._doc, ['_id']));

});

//////////
//DELETE//
//////////

//DELETE sticker from sticker pack
router.delete('/:key/stickers/:stickername', verifyUserAjax, async (req, res) => {	

	try{

		let pack = await StickerPack.findOne({key: req.params.key});

		if(!pack) return res.status(404).send('Sticker Pack not found');
		if(res.locals.userId != pack.creatorId) return res.status(401).send('Unauthorized');

		let sticker_names = pack.stickers.map(s => s.name);
		let deletion_request_index = sticker_names.indexOf(req.params.stickername);
		if(deletion_request_index === -1) return res.status(404).send('Sticker Pack does not have a sticker with that name');

		deleteCdnImage(pack.stickers[deletion_request_index].url);
		pack.stickers.splice(deletion_request_index, 1);
		await pack.save();

		return res.send('Successfully deleted sticker');

	}catch(err){

		if(err.message.includes('Unauthorized')) return res.status(401).send('Unauthorized');
		console.error(err);
		res.status(500).send('Internal server error');

	}

});

module.exports = router;
