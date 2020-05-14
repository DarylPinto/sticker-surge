const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = Schema({
	id: {type: String, unique: true},
	username: {type: String, required: true},
	avatar: {type: String, default: null},
	refresh_token: {type: String, default: ''},
	token_expiry_time: {type: Date, default: Date.now},
	customStickers: [{
		name: {type: String, required: true, maxlength: 20},
		url: {type: String, required: true},
		uses: {type: Number, default: 0},
		creatorId: {type: String, required: true, default: 'unknown'},
		createdAt: {type: Date, default: Date.now},
		createdVia: {type: String, required: true, default: 'unknown'},
		groupType: {type: String, required: true, default: 'user'},
		groupId: {type: String, required: true, default: 'unknown'}
	}],
	bans: [String],
	stickerPacks: [String]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
