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

Accessible by: Users with proper permissions within their Discord Server

### PATCH /guilds/{guild\_id}/sticker-user-role

Usage: Update guild whitelist/blacklist

Body (required): `string:listMode, string:whitelistRole, string:blacklistRole`

Accessible by: Users with proper permissions within their Discord Server

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

### POST /users

Usage: Initialize a user within the service

Body (required): `string:username, string:id`

Accessible by: Stickers for Discord Bot

### POST /users/{user\_id}/stickers

Usage: Create a new custom sticker for a user

Body (required): `string:name, (string:url OR image_file:file)`

Accessible by: User

### POST /users/{user\_id}/stickers/{sticker\_name}/uses

Usage: Increment amount of uses for a custom sticker

Accessible by: Stickers for Discord Bot

### POST /users/{user\_id}/sticker-packs

Usage: Subscribe to a sticker pack

Body (required): `string:packKey`

Accessible by: User

---

### PATCH /users/{user\_id}

Usage: Update user info

Accessible by: Stickers for Discord Bot

### PATCH /users/{user\_id}/stickers/{sticker\_name}

Usage: Edit existing user's custom sticker

Body (required): `string:name`

Accessible by: User

---

## DELETE /users/{user\_id}/stickers/{sticker\_name}

Usage: Delete user's custom sticker

Accessible by: User

## DELETE /users/{user\_id}/sticker-packs

Usage: Unsubscribe from a sticker pack

Body (required): `string:packKey`

Accessible by: User

---

## Sticker Packs

### GET /sticker-packs

Usage: Get list of 12 packs without list of stickers

Parameters (optional): `page=<number of page>, sort=popular|newest|oldest, search=<pack prefix>`

Accessible by: Anyone

### GET /sticker-packs/{pack\_key}

Usage: Get information about a pack

Accessible by: Anyone

### GET /sticker-packs/{pack\_key}/info

Usage: Get information about a pack without list of stickers

Accessible by: Anyone

### GET /sticker-packs/{pack\_key}/stickers

Usage: Get list of custom stickers of a pack

Accessible by: Anyone

### GET /sticker-packs/{pack\_key}/stickers/{sticker\_name}

Usage: Get information about a specific custom sticker from a pack

Accessible by: Anyone

---

### POST /sticker-packs

Usage: Create new sticker pack

Body (required): `string:name, string:key, string:description, image_file:file`

Accessible by: Users who is not banned from creating sticker packs and has voted on Discord Bot List

### POST /sticker-packs/{pack\_key}/publish

Usage: Publish sticker pack

Accessible by: Creator of a pack

### POST /sticker-packs/{pack\_key}/stickers

Usage: Create a new sticker for a pack

Body (required): `string:name, (string:url OR image_file:file)`

Accessible by: Creator of a pack

### POST /sticker-packs/{pack\_key}/stickers/{sticker\_name}/uses

Usage: Increment amount of uses for a sticker

Accessible by: Stickers for Discord Bot

---

### PATCH /sticker-packs/{pack\_key}

Usage: Update sticker pack

Body (optional): `string:name, string:key, string:description, image_file:file`

Accessible by: Creator of a pack

### PATCH /sticker-packs/{pack\_key}/stickers/{sticker\_name}

Usage: Edit existing pack's sticker

Body (required): `string:name`

Accessible by: Creator of a pack

---

### DELETE /sticker-packs/{pack\_key}

Usage: Delete unpublished sticker pack

Accessible by: Creator of a pack

### DELETE /sticker-packs/{pack\_key}/stickers/{sticker\_name}

Usage: Delete sticker from sticker pack

Accessible by: Creator of a pack

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
| isActive | Boolean | Is server exists and is bot in server? |
| stickerPacks | Array of Strings | List of aviable sticker packs' keys |
| guildManagerIds | Array of Snowflakes (Strings) | List of users with Administrator permission |
| stickerManagers | Object | Role that allow to edit custom stickers and (un)subscribe to sticker packs and list of users with that role |
| blacklist | Object | Role that disallow to use stickers on this server and list of users with that role (empty if `roleId` is "@everyone" or null) |
| whitelist | Object | Role that allow to use stickers on this server and list of users with that role (empty if `roleId` is "@everyone" or null) |
| listMode | String | `whitelist` or `blacklist` |
| customStickers | Array of Sticker objects | List of custom stickers of the server |
| commandPrefix | String | Prefix of bot commands |
| icon | String | Guild [icon hash](https://discordapp.com/developers/docs/reference#image-formatting) |

### User

| Field | Type | Description |
| --- | --- | --- |
| id | Snowflake (String) | User ID |
| createdStickerPacks | Array of Strings | List of keys of sticker packs created by user |
| username | String | User name |
| stickerPacks | Array of Strings | List of keys of sticker packs that user subscribed for |
| bans | Array of Strings | List of banned features for user (only 'CREATE_STICKER_PACK' ban is extist right now) |
| customStickers | Array of Sticker objects | List of user's private stickers |
| avatar | String | User [avatar hash](https://discordapp.com/developers/docs/reference#image-formatting) |

### Sticker pack

| Field | Type | Description |
| --- | --- | --- |
| name | String | Pack name |
| key | String | Pack key |
| description | String | Pack description |
| creatorId | Snowflake (String) | User ID of creator |
| stickers | Array of Sticker objects | List of pack's stickers |
| createdAt | Date (String) | Date and time of pack's creation |
| subscribers | Integer | Amount of pack's subscribers |
| listed | Boolean | Is pack listed? |
| published | Boolean | Is pack published? |
| icon | String | URL of pack's icon |

### Sticker
| Field | Type | Description |
| --- | --- | --- |
| name | String | Sticker name |
| url | String | URL of sticker |
| groupId | String | Pack prefix if `groupType` is `sticker-pack`, user/server ID if `groupType` is `user`/`guild` |
| groupType | String | Is this sticker from `sticker-pack` or `user`'s/`guild`'s custom stickers list? |
| createdVia | String | Is this sticker was created via `website` or `discord`? |
| createdAt | Date (String) | Date and time of sticker's creation |
| createdId | Snowflake (String) | User ID of creator |
| uses | Integer | Amount of uses |
