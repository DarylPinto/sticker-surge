const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

//Model
const User = require('../../common/models/user.js');

//Get all users
router.get('/', function(req, res, next){
	User.find({})
	.then(users => { res.json(users) })
	.catch(err => res.send(err));	
});

//Get individual user
router.get('/:id', function(req, res, next){
	User.findOne({id: req.params.id})
	.then(user => { res.json(user) })
	.catch(err => res.send(err));	
});

module.exports = router;