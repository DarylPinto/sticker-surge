const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const rp = require('request-promise');
const fileType = require('file-type');
const api = require('./api-methods.js');
const emojis =  require('../../common/assets/emojis.json');

//Models
const User = require('../../common/models/user.js');
const StickerPack = require('../../common/models/sticker-pack.js');

///////
//GET//
///////

//Get all users
router.get('/', function(req, res, next){
	User.find({})
	.then(users => res.json(users))
	.catch(err => res.json({status: "error", message: "Database error"}));	
});

//Get individual user
router.get('/:id', function(req, res, next){
	User.findOne({id: req.params.id})
	.then(user => res.json(user))
	.catch(err => res.json({status: "error", message: "Database error"}));	
});

//Get individual user's stickers
router.get('/:id/custom-stickers', function(req, res, next){
	User.findOne({id: req.params.id})
	.then(user => res.json(user.customStickers))
	.catch(err => res.json({status: "error", message: "Database error"}));	
});

//Get a specific sticker from an individual user's custom stickers
router.get('/:id/custom-stickers/:stickername', function(req, res, next){
	User.findOne({id: req.params.id})
	.then(user =>{

		let index = user.customStickers.map(s=>s.name).indexOf(req.params.stickername);
		if(index > -1) res.json(user.customStickers[index])
		else res.json({status: "error", message: "There is no sticker with that name"});
		
	})
	.catch(err => res.json({status: "error", message: "Database error"}));	
});

//Get individual user's sticker packs
router.get('/:id/sticker-packs', function(req, res, next){
	User.findOne({id: req.params.id})
	.then(user => res.json(user.stickerPacks))
	.catch(err => res.json({status: "error", message: "Database error"}));	
});

////////
//POST//
////////

//Add to individual user's stickers
router.post('/:id/custom-stickers', function(req, res, next){
	
	User.findOne({id: req.params.id})
	.then(user => {
		return api.validateStickerPostRequest(req, user, 'customStickers');
	})
	.then(values => {	

		let stickerURL = values[0];
		let user = values[1];

		user.customStickers.push({
			name: req.body.name,
			url: stickerURL,
			uses: 0,
			createdAt: new Date()
		});
		user.save()
		.then(()=>{
			res.json({status: "success", message: req.body.name+" sticker created"});
		})
		.catch(err => res.json({status: "error", message: "Database error"}));

	})
	.catch(err => res.json({status: "error", message: "Database error"}));

});


//Add to individual user's sticker packs
router.post('/:id/sticker-packs', function(req, res, next){

	//ensure request body has sticker pack key
	if(!req.body.key){	
		res.json({status: "error", message: "Incomplete request body"});
		return;
	}

	Promise.all([
		User.findOne({id: req.params.id}),
		StickerPack.findOne({key: req.body.key})
	])
	.then(values => {

		let user = values[0];
		let pack = values[1];

		if(!pack){
			res.json({status: "error", message: "There is no sticker pack with that key. See http://discordstickers.io/api/sticker-packs"});
			return;
		}

		if(user.stickerPacks.includes(pack.key)){
			res.json({status: "error", message: "User already has "+pack.name+" sticker pack installed"});
			return;
		}

		user.stickerPacks.push(pack.key);
		user.save()
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

//Delete a specific sticker from an individual user's custom stickers
router.delete('/:id/custom-stickers/:stickername', function(req, res, next){
	User.findOne({id: req.params.id})
	.then(user =>{

		let index = user.customStickers.map(s=>s.name).indexOf(req.params.stickername);
		if(index > -1){
			user.customStickers.splice(index, 1);
			user.save()
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

//Remove a specific sticker pack from an individual user
router.delete('/:id/sticker-packs/:key', function(req, res, next){

	Promise.all([
		User.findOne({id: req.params.id}),
		StickerPack.findOne({key: req.params.key})
	])
	.then(values => {

		let user = values[0];
		let pack = values[1];

		if(!pack){
			res.json({status: "error", message: "There is no sticker pack with that key. See http://discordstickers.io/api/sticker-packs"});
			return;
		}

		if(!user.stickerPacks.includes(pack.key)){
			res.json({status: "error", message: "User does not have "+pack.name+" sticker pack installed"});
			return;
		}

		let index = user.stickerPacks.indexOf(req.params.key);
		user.stickerPacks.splice(index, 1);

		user.save()
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