const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stickerPackSchema = Schema({
	name: String,
	prefix: String,
	creatorId: Number,
	creatorName: String,
	creatorAvatarURL: String,
	stickers: [{type: Schema.Types.ObjectId, ref: 'Sticker'}]
});

let StickerPack = mongoose.model('StickerPack', stickerPackSchema);

module.exports = StickerPack;