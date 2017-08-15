const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stickerPackSchema = Schema({
	name: String,
	key: {type: String, unique: true},
	installs: {type: Number, default: 0},
	creatorId: {type: String, required: true},
	stickers: [{
		name: String,
		url: String,
		uses: {type: Number, default: 0},
		creatorId: {type: String, required: true, default: 'unknown'},
		createdAt: {type: Date, default: Date.now},	
		createdVia: {type: String, required: true, default: 'website'},
		groupType: {type: String, required: true, default: 'sticker-pack'},
		groupId: {type: String, required: true, default: 'unknown'}
	}]
});

const StickerPack = mongoose.model('StickerPack', stickerPackSchema);

module.exports = StickerPack;
