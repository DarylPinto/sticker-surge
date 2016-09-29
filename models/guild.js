const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const guildSchema = Schema({
	id: {type: String, unique: true},
	managerRole: String,
	recentStickers: Array,
	customStickers: [{type: Schema.Types.ObjectId, ref: 'Sticker'}],
	stickerPacks: [{type: Schema.Types.ObjectId, ref: 'StickerPack'}]
});

let Guild = mongoose.model('Guild', guildSchema);

module.exports = Guild;
