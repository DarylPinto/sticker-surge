const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const guildSchema = Schema({
	id: {type: String, unique: true, required: true},
	managerRole: {type: String, default: '@everyone'},
	prefix: {type: String, default: '$'},
	recentStickers: [String],
	customStickers: [{
		name: {type: String, required: true, maxlength: 20},
		url: {type: String, required: true},
		uses: {type: Number, default: 0},
		createdAt: {type: Date, default: Date.now}
	}],
	stickerPacks: [String]
});

let Guild = mongoose.model('Guild', guildSchema);

module.exports = Guild;
