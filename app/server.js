const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const sessions = require('client-sessions');
const path = require('path');
const verifyUser = require('./middleware/verify-user.js')({ajax: false});
const setGuildsCookie = require('./middleware/set-guilds-cookie.js');
const covert = require('../covert.js');

const app = express();
const port = 3000;

//DB init
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/stickers-for-discord');
const db = mongoose.connection;
db.on('error', err => {if(err) throw err});

//Middleware
app.disable('x-powered-by');
app.use(bodyParser.json());
app.use(sessions({
	cookieName: 'session',
	secret: covert.session.secret,
	duration: 365 * 24 * 60 * 60 * 1000,
	cookie: {
		httpOnly: true
	}
}));

//Public dir 
app.use('/', express.static('frontend/public'));

//Routes
app.use('/login', require('./routes/auth.js').login);
app.use('/logout', require('./routes/auth.js').logout);
app.use('/callback', require('./routes/auth.js').callback);

app.get('/stickers', verifyUser, (req, res) => {	
	res.redirect(`/user/${req.session.id}`);
});

//API
app.use('/api/users', require('./api/users.js'));
app.use('/api/guilds', require('./api/guilds.js'));
//app.use('/api/sticker-packs', require('./api/sticker-packs.js'));

app.use('/api/stats', require('./api/stats.js'));
app.get('/api/set-guilds', verifyUser, setGuildsCookie, (req, res) => {
	res.send('Guilds cookie updated');
});
app.get('/api/invalidate-token', (req, res) => {
	req.session.token = 'invalidated';
	res.send('Token invalidated');
});

//Redirect all other traffic to app root
app.get('*', (req, res) => {
	res.sendFile(__dirname+'/frontend/public/index.html');
});

app.listen(port, () => {
	console.log(`Server running on port ${port}!`);
});