const router = require('express').Router();
const Guild = require('./models/guild-model.js');
const User = require('./models/user-model.js');

router.get('/', (req, res) => {

	Promise.all([Guild.count({isActive: true}), User.count({})])
	.then(stats => {	
		res.json({guilds: stats[0], users: stats[1]});
	})
	.catch(err => res.status(503).send('Database error'));
});

module.exports = router;