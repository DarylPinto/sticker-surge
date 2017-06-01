const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const guildSchema = Schema({
	id: {type: String, unique: true, required: true},
	guildName: {type: String, required: true},
	icon: {type: String, required: true},
	commandPrefix: {type: String, default: '$'},
	customStickers: [{
		name: {type: String, required: true, maxlength: 20},
		url: {type: String, required: true},
		uses: {type: Number, default: 0},
		createdAt: {type: Date, default: Date.now}
	}],
	recentStickers: [String],
	stickerPacks: [String],
	managerRole: {type: String, default: '@everyone'},
	managerIds: [String]
});

let Guild = mongoose.model('Guild', guildSchema);

module.exports = Guild;
