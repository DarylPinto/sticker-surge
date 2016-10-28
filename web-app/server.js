const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const index = require('./routes/index');
const users = require('./routes/users');
const guilds = require('./routes/guilds');
const stickerPacks = require('./routes/sticker-packs');

const api_users = require('./routes/api/users');
const api_guilds = require('./routes/api/guilds');
const api_stickerPacks = require('./routes/api/sticker-packs');

let app = express();
let port = 3000;

//DB Init
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/test');
const db = mongoose.connection;
db.on('error', err => console.error(err));

//View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

//Set Static Folder
app.use(express.static(path.join(__dirname, 'client')));

//Body Parser MW
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//Views
app.use('/', index);
app.use('/users', users);
app.use('/guilds', guilds);
app.use('/sticker-packs', stickerPacks);

//API
app.use('/api/users', api_users);
app.use('/api/servers', api_guilds);
app.use('/api/sticker-packs', api_stickerPacks);

app.listen(port, function(){
	console.log(`Server started on port ${port}!`);
});