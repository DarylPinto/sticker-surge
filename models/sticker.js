const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stickerSchema = Schema({
	name: String,
	type: String, //'group', 'personal' or 'pack'
	url: String,
	creator: {type: Schema.Types.ObjectId, ref: 'User'},
	uses: Number
});

let Sticker = mongoose.model('Sticker', stickerSchema);

module.exports = Sticker;
