const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const guildSchema = Schema({
	id: {type: String, unique: true, required: true},
	managerRole: {type: String, default: '@everyone'},
	recentStickers: [String],
	customStickers: [{type: Schema.ObjectId, ref: 'Sticker'}],
	stickerPacks: [{type: Schema.ObjectId, ref: 'StickerPack'}]
});

let Guild = mongoose.model('Guild', guildSchema);

module.exports = Guild;
