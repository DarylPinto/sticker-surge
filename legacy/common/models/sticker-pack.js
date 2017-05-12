const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stickerPackSchema = Schema({
	name: String,
	key: {type: String, unique: true},
	installs: {type: Number, default: 0},
	creator: {type: Schema.Types.ObjectId, ref: 'User'},
	stickers: [{
		name: String,
		url: String,
		uses: Number,
		createdAt: Date
	}]
});

let StickerPack = mongoose.model('StickerPack', stickerPackSchema);

module.exports = StickerPack;
