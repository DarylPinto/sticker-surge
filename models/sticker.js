const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stickerSchema = Schema({
	name: String,
	url: String,
	creatorId: Number,
	uses: Number
});

let Sticker = mongoose.model('Sticker', stickerSchema);

module.exports = Sticker;

