const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const api = require('./api-methods.js');
const emojis =  require('../../common/assets/emojis.json');

//Model
const Guild = require('../../common/models/guild.js');

///////
//GET//
///////

//Get all guilds
router.get('/', function(req, res, next){
	Guild.find({})
	.then(guilds => res.json(guilds.map(g=>api.removeProps(['__v', '_id'], g))))
	.catch(err => res.json({status: "error", message: "Database error"}));	
});

//Get individual guild
router.get('/:id', function(req, res, next){
	Guild.findOne({id: req.params.id})
	.then(guild => res.json(api.removeProps(['__v', '_id'], guild)))
	.catch(err => res.json({status: "error", message: "Database error"}));	
});

//Get individual guild's stickers
router.get('/:id/custom-stickers', function(req, res, next){
	Guild.findOne({id: req.params.id})
	.then(guild => res.json(guild.customStickers))
	.catch(err => res.send(err));		
});

//Get a specific sticker from an individual guild's custom stickers
router.get('/:id/custom-stickers/:stickername', function(req, res, next){
	Guild.findOne({id: req.params.id})
	.then(guild =>{

		let index = guild.customStickers.map(s=>s.name).indexOf(req.params.stickername);
		if(index > -1) res.json(guild.customStickers[index])
		else res.json({status: "error", message: "There is no sticker with that name"});
		
	})
	.catch(err => res.json({status: "error", message: "Database error"}));	
});

//Get individual guild's sticker packs
router.get('/:id/sticker-packs', function(req, res, next){
	Guild.findOne({id: req.params.id})
	.then(guild => res.json(guild.stickerPacks))
	.catch(err => res.json({status: "error", message: "Database error"}));	
});

////////
//POST//
////////

//Add to individual guild's stickers
router.post('/:id/custom-stickers', function(req, res, next){
	
	Guild.findOne({id: req.params.id})
	.then(guild => {
		return api.validateStickerPostRequest(req, guild, 'customStickers');
	})
	.then(values => {	

		let stickerURL = values[0];
		let guild = values[1];

		guild.customStickers.push({
			name: req.body.name,
			url: stickerURL,
			uses: 0,
			createdAt: new Date()
		});
		guild.save()
		.then(()=>{
			res.json({status: "success", message: req.body.name+" sticker created"});
		})
		.catch(err => res.json({status: "error", message: "Database error"}));

	})
	.catch(err => res.json({status: "error", message: err}));

});


//Add to individual guild's sticker packs
router.post('/:id/sticker-packs', function(req, res, next){

	//ensure request body has sticker pack key
	if(!req.body.key){	
		res.json({status: "error", message: "Incomplete request body"});
		return;
	}

	Promise.all([
		Guild.findOne({id: req.params.id}),
		StickerPack.findOne({key: req.body.key})
	])
	.then(values => {

		let guild = values[0];
		let pack = values[1];

		if(!pack){
			res.json({status: "error", message: "There is no sticker pack with that key. See http://discordstickers.io/api/sticker-packs"});
			return;
		}

		if(guild.stickerPacks.includes(pack.key)){
			res.json({status: "error", message: "Guild already has "+pack.name+" sticker pack"});
			return;
		}

		guild.stickerPacks.push(pack.key);
		guild.save()
		.then(()=>{
			res.json({status: "success", message: pack.name+" sticker pack added"});	
		})
		.catch(err => res.json({status: "error", message: "Database error"}));

		pack.installs++;
		pack.save();

	})
	.catch(err => res.json({status: "error", message: "Database error"}));	

});

//////////
//DELETE//
//////////

//Delete a specific sticker from an individual guild's custom stickers
router.delete('/:id/custom-stickers/:stickername', function(req, res, next){
	Guild.findOne({id: req.params.id})
	.then(guild =>{

		let index = guild.customStickers.map(s=>s.name).indexOf(req.params.stickername);
		if(index > -1){
			guild.customStickers.splice(index, 1);
			guild.save()
			.then(()=>{
				res.json({status: "success", message: req.params.stickername+" sticker deleted"});
			})
			.catch(err => res.json({status: "error", message: "Database error"}));	

		}else{
			res.json({status: "error", message: "There is no sticker with that name"});
		}

	})
	.catch(err => res.json({status: "error", message: "Database error"}));	
});

//Remove a specific sticker pack from an individual guild
router.delete('/:id/sticker-packs/:key', function(req, res, next){

	Promise.all([
		Guild.findOne({id: req.params.id}),
		StickerPack.findOne({key: req.params.key})
	])
	.then(values => {

		let guild = values[0];
		let pack = values[1];

		if(!pack){
			res.json({status: "error", message: "There is no sticker pack with that key. See http://discordstickers.io/api/sticker-packs"});
			return;
		}

		if(!guild.stickerPacks.includes(pack.key)){
			res.json({status: "error", message: "Guild does not have "+pack.name+" sticker pack"});
			return;
		}

		let index = guild.stickerPacks.indexOf(req.params.key);
		guild.stickerPacks.splice(index, 1);

		guild.save()
		.then(()=>{
			res.json({status: "success", message: pack.name+" sticker pack removed"});	
		})
		.catch(err => res.json({status: "error", message: "Database error"}));

		pack.installs--;
		pack.save();

	})
	.catch(err => res.json({status: "error", message: "Database error"}));	

});

module.exports = router;