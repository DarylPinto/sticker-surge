# Stickers for Discord RESTful API

*BASE URI: https://stickersfordiscord.com/api*

> This API is intended to aid interaction between various components within *Stickers for Discord*, but is open for public use as well.

## Guilds (Servers)

### GET /guilds/{guild\_id}

Usage: Get information about a guild

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

Body (required): `string:name, string:id`

Accessible by: Stickers for Discord Bot

### POST /guilds/{guild\_id}/stickers

Usage: Create a new custom sticker for a guild

Body (required): `string:name, (string:url OR image_file:file)`

Accessible by: Users with proper permissions within their Discord Server

### POST /guilds/{guild\_id}/stickers/{sticker\_name}/uses

Usage: Increment amount of uses for a custom sticker within a guild

Accessible by: Stickers for Discord Bot

---

### PATCH /guilds/{guild_id}

Usage: Update guild info

Body (optional): `string:guildName, string:icon, array:guildManagerIds, array:stickerManagerIds`

Accessible by: Stickers for Discord Bot