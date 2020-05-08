# Sticker Surge

> Custom stickers and sticker packs for Discord servers!

![Preview](http://i.imgur.com/8sHjDhP.png)

## How to use

To get stickers on your Discord server, simply head over to https://stickersurge.com and click the "Add to Discord" button!

For more detailed instructions, check out the [documentation.](https://stickersurge.com/docs)

## Why

One of my gaming groups used to bounce around various messaging and VoIP clients looking for the one that would best suit our needs. Eventually we settled with [Telegram](https://telegram.org/) due to the ease of use and polished interface on all platforms. However, it still lacked a lot of crucial features that we were looking for such as the ability to ping specific users in a group and voice chat without relying on yet another service.

Enter [Discord](https://discordapp.com/). This rapidly developing app appeared to be the *perfect* solution to our conundrum. It had everything we were looking for and more— except for one little Telegram feature that we'd accidentally fallen in love with: **Stickers**.

I decided I'd try to my hand at making [a little Discord sticker-bot](https://github.com/DarylPinto/discord-stickerbot) on my Raspberry Pi to substitute the feature. While it worked pretty well, it was fairly barebones and lacked some important elements - the most noticable one being the fact that it was exclusive to a single Discord server. I began thinking about how I could expand the bot to be used on any server, and it eventually became clear that a full redesign and refactor was necessary to facilitate the additions that I really wanted to include.

And so, this project was born.

## Support

For help with Sticker Surge, join the support server: [https://discord.gg/HNFmKsE](https://discord.gg/HNFmKsE)

## Built with

* [Node](https://nodejs.org/)
* [Express](https://expressjs.com/)
* [MongoDB](https://www.mongodb.com/)
* [Vue](https://vuejs.org/)
* [DiscordJS](https://discord.js.org/#/)
