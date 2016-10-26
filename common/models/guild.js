const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const guildSchema = Schema({
	id: {type: String, unique: true, required: true},
	managerRole: {type: String, default: '@everyone'},
	prefix: {type: String, default: '$'},
	recentStickers: [String],
	customStickers: [{
		name: String,
		url: String,
		uses: Number,
		createdAt: Date
	}],
	stickerPacks: [String]
});

let Guild = mongoose.model('Guild', guildSchema);

module.exports = Guild;
