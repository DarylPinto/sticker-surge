const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

//Model
const StickerPack = require('../../common/models/sticker-pack.js');

//Get all sticker packs
router.get('/', function(req, res, next){
	StickerPack.find({})
	.then(packs => res.json(packs))
	.catch(err => res.send(err));	
});

//Get individual sticker pack
router.get('/:key', function(req, res, next){
	StickerPack.findOne({key: req.params.key})
	.then(pack => res.json(pack))
	.catch(err => res.send(err));	
});

//Get individual sticker pack
router.get('/:key/stickers', function(req, res, next){
	StickerPack.findOne({key: req.params.key})
	.then(pack => res.json(pack.stickers))
	.catch(err => res.send(err));	
});

module.exports = router;