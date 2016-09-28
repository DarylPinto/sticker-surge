const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const guildSchema = Schema({
	id: String,
	managerRole: String,
	recentStickers: Array,
	customStickers: [{type: Schema.Types.ObjectId, ref: 'Sticker'}],
	stickerPackPrefixes: Array
});

let Guild = mongoose.model('Guild', guildSchema);

module.exports = Guild;