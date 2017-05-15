const rp = require('request-promise');
const router = require('express').Router();

router.get('/', (req, res) => {

	if(!req.session.tok) return res.redirect('/login');

	rp({
		method: 'GET',
		uri: 'https://discordapp.com/api/users/@me',
		headers: {
			'Authorization': `Bearer ${req.session.tok}`
		}
	})
	.then(data => {
		data = JSON.parse(data);
		res.redirect(`/user/${data.id}`);
	})
	.catch(err => {
		console.log(err.message);
		if(err.message.includes('401: Unauthorized')) return res.redirect('/login');
	});

});

module.exports = router;