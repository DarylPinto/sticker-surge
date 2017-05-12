const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next){
	res.render('guilds.html');
});

module.exports = router;