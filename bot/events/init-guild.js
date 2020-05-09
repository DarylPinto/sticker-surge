const rp = require("request-promise");

module.exports = async (guild, bot_auth) => {
	try {
		// Add guild to database
		await rp({
			method: "POST",
			uri: `${process.env.APP_URL}/api/guilds/`,
			body: {
				id: guild.id,
				guildName: guild.name,
				icon: guild.icon || null
			},
			headers: { Authorization: bot_auth },
			json: true
		});

		console.log(`Guild ${guild.id} added!`);
	} catch (err) {
		// If guild already exists
		if (err.statusCode === 409) {
			// Re-Activate guild, as it already exists within database
			try {
				await rp({
					method: "PATCH",
					uri: `${process.env.APP_URL}/api/guilds/${guild.id}`,
					body: { isActive: true },
					headers: { Authorization: bot_auth },
					json: true
				});

				console.log(`Guild ${guild.id} activated!`);
			} catch (err) {
				console.log(`Error initializing guild: ${err.message}`);
			}
		} else {
			console.log(`Error initializing guild: ${err.message}`);
		}
	}
};
