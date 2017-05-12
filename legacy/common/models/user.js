const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = Schema({
	id: {type: String, unique: true},
	username: String,
	avatarURL: String,
	customStickers: [{
		name: String,
		url: String,
		uses: Number,
		createdAt: Date
	}],
	createdStickerPacks: [String],
	stickerPacks: [String]
});

let User = mongoose.model('User', userSchema);

module.exports = User;
