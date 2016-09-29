const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stickerPackSchema = Schema({
	name: String,
	prefix: String,
	creator: {type: Schema.Types.ObjectId, ref: 'User'},
	stickers: [{type: Schema.Types.ObjectId, ref: 'Sticker'}]
});

let StickerPack = mongoose.model('StickerPack', stickerPackSchema);

module.exports = StickerPack;
