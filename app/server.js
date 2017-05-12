const rp = require('request-promise');
const express = require('express');
const sessions = require('client-sessions');
const path = require('path');

const app = express();
const port = 3000;

//Middleware
app.use(sessions({
	cookieName: 'session',
	secret: 'sampletextsampletext',
	duration: 10 * 60 * 1000,
	activeDuration: 5 * 60 * 1000
}));

//Public dir 
app.use('/', express.static('frontend/public'));

//Routes
const auth = require('./routes/auth.js');
app.use('/login', auth.login);
app.use('/callback', auth.callback);

app.get('/dash', (req, res) => {	
	res.json(req.session.tok);
});

app.listen(port, () => {
	console.log(`Server running on port ${port}!`);
});