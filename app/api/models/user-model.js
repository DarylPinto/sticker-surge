const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = Schema({
	id: {type: String, unique: true},
	username: {type: String, required: true},
	refresh_token: {type: String, default: ''},
	customStickers: [{
		name: {type: String, required: true},
		url: {type: String, required: true},
		uses: {type: Number, default: 0},
		createdAt: {type: Date, default: Date.now}
	}],
	createdStickerPacks: [String],
	stickerPacks: [String]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
