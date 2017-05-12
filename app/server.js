const rp = require('request-promise');
const express = require('express');
const sessions = require('client-sessions');
const path = require('path');
const covert = require('../covert.js');

const app = express();
const port = 3000;

//Middleware
app.use(sessions({
	cookieName: 'session',
	secret: covert.session.secret,
	duration: 10 * 60 * 1000,
	activeDuration: 5 * 60 * 1000
}));

//Public dir 
app.use('/', express.static('frontend/public'));

//Routes
app.use('/login', require('./routes/auth.js').login);
app.use('/callback', require('./routes/auth.js').callback);

app.get('/dash', (req, res) => {	
	res.json(req.session.tok);
});

//API
/*
app.use('/api/user', require('./api/user.js'));
app.use('/api/guild', require('./api/guild.js'));
app.use('/api/sticker-pack', require('./api/sticker-pack.js'));
*/

//Redirect all other traffic to app root
app.get('*', (req, res) => {
	res.sendFile(__dirname+'/frontend/public/index.html');
});

app.listen(port, () => {
	console.log(`Server running on port ${port}!`);
});