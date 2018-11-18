# Stickers for Discord RESTful API

*BASE URI: https://stickersfordiscord.com/api*

> This API is intended to aid interaction between various components within *Stickers for Discord*, but is open for public use as well.

## Guilds (Servers)

### GET /guilds/{guild\_id}

Usage: Get information about a guild

Accessible by: Anyone

### GET /guilds/{guild\_id}/info

Usage: Get information about a guild without list of custom stickers

Accessible by: Anyone

### GET /guilds/{guild\_id}/stickers

Usage: Get list of custom stickers from a guild 

Accessible by: Anyone

### GET /guilds/{guild\_id}/stickers/{sticker\_name}

Usage: Get information about a specific custom sticker from a guild

Accessible by: Anyone

--- 

### POST /guilds

Usage: Initialize a guild within the service

Body (required): `string:guildName, string:id`

Accessible by: Stickers for Discord Bot

### POST /guilds/{guild\_id}/stickers

Usage: Create a new custom sticker for a guild

Body (required): `string:name, (string:url OR image_file:file)`

Accessible by: Users with proper permissions within their Discord Server

### POST /guilds/{guild\_id}/stickers/{sticker\_name}/uses

Usage: Increment amount of uses for a custom sticker within a guild

Accessible by: Stickers for Discord Bot

### POST /guilds/{guild\_id}/sticker-packs

Usage: Subscribe to a sticker pack

Body (required): `string:packKey`

Accessible by: Users with proper permissions within their Discord Server

---

### PATCH /guilds/{guild\_id}

Usage: Update guild info

Body (optional): `string:guildName, string:icon, array:guildManagerIds, array:stickerManagerIds`

Accessible by: Stickers for Discord Bot

### PATCH /guilds/{guild\_id}/stickers/{sticker\_name}

Usage: Edit existing guild's custom sticker

Body (required): `string:name`

Accessible by: Users with proper permissions within their Discord Server

### PATCH /guilds/{guild\_id}/command-prefix

Usage: Edit prefix of the bot commands

Body (required): `string:commandPrefix`

Accessible by: Stickers for Discord Bot and users with proper permissions within their Discord Server

### PATCH /guilds/{guild\_id}/sticker-user-role

Usage: Update guild whitelist/blacklist

Body (required): `string:listMode, string:whitelistRole, string:blacklistRole`

Accessible by: Stickers for Discord Bot and users with proper permissions within their Discord Server

---

## DELETE /guilds/{guild\_id}/stickers/{sticker\_name}

Usage: Delete guild's custom sticker

Accessible by: Users with proper permissions within their Discord Server

## DELETE /guilds/{guild\_id}/sticker-packs

Usage: Unsubscribe from a sticker pack

Body (required): `string:packKey`

Accessible by: Users with proper permissions within their Discord Server

---

## Users

### GET /users/{user\_id}

Usage: Get information about a user

Accessible by: Anyone

### GET /users/{user\_id}/info

Usage: Get information about a user without list of custom stickers

Accessible by: Anyone

### GET /users/{user\_id}/stickers

Usage: Get list of custom stickers of a user 

Accessible by: Anyone

### GET /users/{user\_id}/stickers/{sticker\_name}

Usage: Get information about a specific custom sticker of a guild

Accessible by: Anyone

--- 

## Sticker Packs

### GET /sticker-packs

Usage: Get list of 12 packs without list of stickers

Parameters (optional): `page=<number of page>, sort=popular|newest|oldest, search=<pack prefix>`

Accessible by: Anyone

### GET /sticker-packs/{pack\_prefix}

Usage: Get information about a pack

Accessible by: Anyone

### GET /sticker-packs/{pack\_prefix}/info

Usage: Get information about a pack without list of stickers

Accessible by: Anyone

### GET /sticker-packs/{pack\_prefix}/stickers

Usage: Get list of custom stickers of a pack

Accessible by: Anyone

### GET /sticker-packs/{pack\_prefix}/stickers/{sticker\_name}

Usage: Get information about a specific custom sticker from a pack

Accessible by: Anyone

---

## Statistics

## GET /stats

Usage: Get statistics about number of active and inactive guilds, sticker packs, their subscribers, users, stickers

Accessible by: Anyone

## GET /stats/recent-stickers

Usage: Get list of 25 newest stickers

Accessible by: Anyone

## GET /stats/most-used-stickers

Usage: Get list of 25 most used guilds' stickers, 25 most used users' stickers, 25 most used packs' stickers

Accessibe by: Anyone

--- 

## Objects Structure

### Guild (Server)

| Field | Type | Description |
| --- | --- | --- |
| id | Snowflake (String) | Guild ID |
| guildName | String | Guild Name |
| isActive | Boolean | TODO |
| stickerPacks | Array of Strings | List of aviable sticker packs' prefixes |
| guildManagerIds | Array of Snowflakes (Strings) | List of users with Administrator permission |
| stickerManagers | Object | Role that allow to edit custom stickers and (un)subscribe to sticker packs and list of users with that role |
| blacklist | Object | Role that disallow to use stickers on this server and list of users with that role (empty if `roleId` is "@everyone" or null) |
| whitelist | Object | Role that allow to use stickers on this server and list of users with that role (empty if `roleId` is "@everyone" or null) |
| listMode | String | Shows is white- of blacklist enabled (TODO fix) |
| customStickers | Array of Sticker objects | List of custom stickers of the server |
| commandPrefix | String | Prefix of bot commands |
| icon | String | Guild [icon hash](https://discordapp.com/developers/docs/reference#image-formatting) |

### User

| Field | Type | Description |
| --- | --- | --- |
| id | Snowflake (String) | User ID |
| createdStickerPacks | Array of Strings | List of prefixes of sticker packs created by user |
| username | String | User name |
| stickerPacks | Array of Strings | List of prefixes of sticker packs that user subscribed for |
| bans | Array of Strings | List of banned features for user (only 'CREATE_STICKER_PACK' ban is extist right now) |
| customStickers | Array of Sticker objects | List of user's private stickers |
| avatar | String | User [avatar hash](https://discordapp.com/developers/docs/reference#image-formatting) |
