const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

//Model
const Guild = require('../../common/models/guild.js');

//Get all guilds
router.get('/', function(req, res, next){
	Guild.find({})
	.then(guilds => res.json(guilds))
	.catch(err => res.send(err));	
});

//Get individual guild
router.get('/:id', function(req, res, next){
	Guild.findOne({id: req.params.id})
	.then(guild => res.json(guild))
	.catch(err => res.send(err));		
});

//Get individual guild's stickers
router.get('/:id', function(req, res, next){
	Guild.findOne({id: req.params.id})
	.then(guild => res.json(guild.customStickers))
	.catch(err => res.send(err));		
});

module.exports = router;