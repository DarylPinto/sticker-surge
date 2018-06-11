const mongoose = require('../app/node_modules/mongoose');
const User = require('../app/api/models/user-model.js');
const StickerPack = require('../app/api/models/sticker-pack-model.js');

/*
USAGE EXAMPLES:

node moderate unlistpack key=pusheen
node moderate relistpack key=pusheen
node moderate banuser id=1234567 type=0
node moderate unbanuser id=1234567 type=0
node moderate changepackowner packkey=pusheen userid=123456768

*/

//Command in question
const command = process.argv[2];

//Collect command arguments
const options = process.argv.slice(2).reduce((opt, arg) => {
	arg = arg.split('=');	
	opt[arg[0]] = arg[1];
	return opt;
}, {});

//Types of user bans
const banTypes = {
	'0': 'CREATE_STICKER_PACK' 
}

//Program commands
const commands = {
	unlistpack: async function(){

		if(!options.key) return console.error('Provide a Sticker Pack key using: key=NAME');

		try{
			let pack = await StickerPack.findOne({key: options.key});
			if(!pack) return console.log('Pack does not exist');
			if(!pack.listed) return console.log(`${pack.name} is already un-listed`);

			pack.listed = false;
			await pack.save();
			return console.log(`${pack.name} successfully un-listed.`);
		}catch(err){
			console.error(err.message);
		}

	},
	relistpack: async function(){

		if(!options.key) return console.error('Provide a Sticker Pack key using: key=NAME');	

		try{
			let pack = await StickerPack.findOne({key: options.key.toLowerCase()});
			if(!pack) return console.log('Pack does not exist');
			if(pack.listed) return console.log(`${pack.name} is already listed`);

			pack.listed = true;
			await pack.save();
			return console.log(`${pack.name} successfully re-listed.`);
		}catch(err){
			console.error(err.message);
		}

	},
	banuser: async function(){

		if(!options.id) return console.error('Provide a User id by using: id=ID');
		if(!options.type) return console.error('Provide a Ban Type by using: type=BANTYPE');

		let ban_string = banTypes[options.type];
		if(!ban_string) return console.error(`Ban type ${options.type} does not exist`);

		try{
			let user = await User.findOne({id: options.id});
			if(!user) return console.log('User does not exist');
			if(user.bans.includes(ban_string)) return console.log(`${user.username} is already banned from: ${ban_string}`);

			user.bans.push(ban_string);
			await user.save();
			return console.log(`${user.username} successfully banned from: ${ban_string}`);
		}catch(err){
			console.error(err.message);
		}

	},
	unbanuser: async function(){

		if(!options.id) return console.error('Provide a User id by using: id=ID');
		if(!options.type) return console.error('Provide a Ban Type by using: type=BANTYPE');

		let ban_string = banTypes[options.type];
		if(!ban_string) return console.error(`Ban type ${options.type} does not exist`);

		try{
			let user = await User.findOne({id: options.id});
			if(!user) return console.log('User does not exist');
			if(!user.bans.includes(ban_string)) return console.log(`${user.username} is not banned from: ${ban_string}`);

			user.bans.splice(user.bans.indexOf(ban_string), 1);
			await user.save();
			return console.log(`${user.username} successfully un-banned from: ${ban_string}`);
		}catch(err){
			console.error(err.message);
		}

	},
	changepackowner: async function(){
		if(!options.userid) return console.error('Provide a User id by using: userid=ID');
		if(!options.packkey) return console.error('Provide a Sticker Pack by using: packkey=KEY');

		try{
			let pack = await StickerPack.findOne({key: options.packkey});
			let user = await User.findOne({id: options.userid});
			if(!pack) return console.log('Pack does not exist');
			if(!user) return console.log('User does not exist');

			pack.creatorId = options.userid;
			pack.stickers.forEach(sticker => {
				sticker.creatorId = options.userid;
			});

			await pack.save();		
			return console.log(`Owner for ${pack.name} successfully changed to ${user.username}.`);
		}catch(err){
			console.error(err.message);
		}

	}
};

//Ensure command is valid before attempting to exec
if(!Object.keys(commands).includes(command)){
	console.error('Unrecognized command');
}else{

	//DB init
	mongoose.Promise = global.Promise;
	const db = mongoose.connection;
	db.on('error', err => {if(err) throw err});

	mongoose.connect('mongodb://localhost/stickers-for-discord').then(() => {

		console.log('===========\n');
		commands[command].call(this, options)
		.then(() => {
			console.log("\n");
			process.exit()
		});	

	});

}
