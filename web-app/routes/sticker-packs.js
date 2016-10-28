const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next){
	res.render('sticker-packs.html');
});

module.exports = router;