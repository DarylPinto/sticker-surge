import axios, { AxiosRequestConfig } from "axios";
import { Guild, Snowflake } from "discord.js";
import "../config";

const BOT_AUTH = `Basic ${Buffer.from(
  process.env.DISCORD_BOT_TOKEN_HASH
).toString("base64")}`;

// TODO: Handle errors in this file

// Types
export enum Status {
  SUCCESS = "success",
  FAILED = "failed",
}

type StickerGroupType = "guild" | "user" | "sticker-pack";

export interface StickerSurgeResponse {
  status: Status;
  data?: any;
  errorMessage?: string;
}

export interface StickerMessageDetails {
  name: string;
  type: StickerGroupType;
  packKey?: string;
  userId: Snowflake;
  guild: Guild;
}

export interface Sticker {
  uses: number;
  creatorId: string;
  createdVia: "discord" | "website";
  groupType: StickerGroupType;
  groupId: string;
  name: string;
  url: string;
}

/**
 * Execute an axios request with a standardized response.
 *
 * If you pass in a `guild` as the second param, then upon
 * a 404 error with "Guild not found" in the response, this function
 * will create a guild and re-execute.
 *
 * @param axiosConfig - Config option for `axios` request
 * @param guild - Discord.js Gulid object
 */
const stickerSurgeAPI = async (
  axiosConfig: AxiosRequestConfig,
  guild?: Guild
): Promise<StickerSurgeResponse> => {
  try {
    const res = await axios(axiosConfig);

    return {
      status: Status.SUCCESS,
      data: res.data,
    };
  } catch (err) {
    // Attempt to `create` a guild on any attempt stickerSurgeAPI request
    // that fails with a `guild not found` error message
    if (err.response?.data?.includes("Guild not found") && guild) {
      await createGuild(guild);
      const res = await stickerSurgeAPI(axiosConfig);
      return res;
    }

    return {
      status: Status.FAILED,
      errorMessage:
        err.response?.data ||
        err.message ||
        `Error keys: ${JSON.stringify(Object.keys(err))}`,
    };
  }
};

/**
 * Create a new Guild in sticker surge. If the guild
 * already exists, attempt to re-activate it
 */
const createGuild = async (guild: Guild): Promise<StickerSurgeResponse> => {
  const data = {
    id: guild.id,
    guildName: guild.name,
    icon: guild.icon || null,
    isActive: true,
  };

  let res = await stickerSurgeAPI({
    method: "POST",
    url: `${process.env.APP_URL}/api/guilds`,
    data,
    headers: { Authorization: BOT_AUTH },
  });

  if (res.errorMessage?.includes("already exists")) {
    res = await stickerSurgeAPI({
      method: "PATCH",
      url: `${process.env.APP_URL}/api/guilds/${guild.id}`,
      data,
      headers: { Authorization: BOT_AUTH },
    });
  }

  return res;
};

const getGuild = async (guild: Guild): Promise<StickerSurgeResponse> => {
  const res = await stickerSurgeAPI(
    {
      method: "GET",
      url: `${process.env.APP_URL}/api/guilds/${guild.id}`,
    },
    guild
  );

  return res;
};

const getGuildInfo = async (guild: Guild): Promise<StickerSurgeResponse> => {
  const res = await stickerSurgeAPI(
    {
      method: "GET",
      url: `${process.env.APP_URL}/api/guilds/${guild.id}/info`,
    },
    guild
  );

  return res;
};

const deactivateGuild = async (guild: Guild): Promise<StickerSurgeResponse> => {
  const res = await stickerSurgeAPI(
    {
      method: "PATCH",
      url: `${process.env.APP_URL}/api/guilds/${guild.id}`,
      data: { isActive: false },
      headers: { Authorization: BOT_AUTH },
    },
    guild
  );

  return res;
};

const updateGuild = async (guild: Guild): Promise<StickerSurgeResponse> => {
  const res = await stickerSurgeAPI(
    {
      method: "PATCH",
      url: `${process.env.APP_URL}/api/guilds/${guild.id}`,
      data: {
        guildName: guild.name,
        icon: guild.icon || null,
        isActive: true,
      },
      headers: { Authorization: BOT_AUTH },
    },
    guild
  );

  return res;
};

const getUserInfo = async (
  userId: Snowflake
): Promise<StickerSurgeResponse> => {
  const res = await stickerSurgeAPI({
    method: "GET",
    url: `${process.env.APP_URL}/api/users/${userId}/info`,
  });

  return res;
};

/**
 * Gets the command prefix that the guild uses for the bot.
 * If we're unable to connect to the sticker surge API, we
 * return the default prefix: "$"
 *
 * @param guild - Guild to get the prefix for
 */
const getPrefix = async (guild: Guild): Promise<string> => {
  const { status, data: guildInfo } = await getGuildInfo(guild);

  if (status === Status.FAILED) return "$";
  return guildInfo.commandPrefix;
};

/**
 * Create a custom guild sticker
 *
 * @param guild - Guild
 * @param userId - User's ID
 * @param stickerName - Desired name for the new sticker
 * @param stickerUrl - Image URL to turn into the sticker
 */
const createSticker = async (
  guild: Guild,
  userId: Snowflake,
  stickerName: string,
  stickerUrl: string
): Promise<StickerSurgeResponse> => {
  const res = await stickerSurgeAPI(
    {
      method: "POST",
      url: `${process.env.APP_URL}/api/guilds/${guild.id}/stickers`,
      data: { name: stickerName.toLowerCase(), url: stickerUrl },
      headers: { Authorization: BOT_AUTH, "Author-Id": userId },
    },
    guild
  );

  return res;
};

/**
 * Delete a custom guild sticker
 *
 * @param guild - Guild
 * @param userId - User's ID
 * @param stickerName - Name of sticker to delete
 */
const deleteSticker = async (
  guild: Guild,
  userId: Snowflake,
  stickerName: string
): Promise<StickerSurgeResponse> => {
  const encodedStickerName = encodeURIComponent(stickerName);
  const res = await stickerSurgeAPI(
    {
      method: "DELETE",
      url: `${process.env.APP_URL}/api/guilds/${guild.id}/stickers/${encodedStickerName}`,
      headers: { Authorization: BOT_AUTH, "Author-Id": userId },
    },
    guild
  );

  return res;
};

const setPrefix = async (
  guild: Guild,
  userId: Snowflake,
  commandPrefix: string
): Promise<StickerSurgeResponse> => {
  const res = await stickerSurgeAPI(
    {
      method: "PATCH",
      url: `${process.env.APP_URL}/api/guilds/${guild.id}/command-prefix`,
      data: { commandPrefix },
      headers: { Authorization: BOT_AUTH, "Author-Id": userId },
    },
    guild
  );

  return res;
};

const setManagerRole = async (
  guild: Guild,
  userId: Snowflake,
  stickerManagerRole: Snowflake
): Promise<StickerSurgeResponse> => {
  const res = await stickerSurgeAPI(
    {
      method: "PATCH",
      url: `${process.env.APP_URL}/api/guilds/${guild.id}/sticker-manager-role`,
      data: { stickerManagerRole },
      headers: { Authorization: BOT_AUTH, "Author-Id": userId },
    },
    guild
  );

  return res;
};

const addPack = async (
  guild: Guild,
  userId: Snowflake,
  packKey: string
): Promise<StickerSurgeResponse> => {
  let res = await stickerSurgeAPI(
    {
      method: "POST",
      url: `${process.env.APP_URL}/api/guilds/${guild.id}/sticker-packs`,
      data: { packKey },
      headers: { Authorization: BOT_AUTH, "Author-Id": userId },
    },
    guild
  );

  return res;
};

const removePack = async (
  guild: Guild,
  userId: Snowflake,
  packKey: string
): Promise<StickerSurgeResponse> => {
  const res = await stickerSurgeAPI(
    {
      method: "DELETE",
      url: `${process.env.APP_URL}/api/guilds/${guild.id}/sticker-packs`,
      data: { packKey },
      headers: { Authorization: BOT_AUTH, "Author-Id": userId },
    },
    guild
  );

  return res;
};

const updateAllowLists = async (
  guild: Guild,
  userId: Snowflake,
  listMode: "whitelist" | "blacklist",
  roleId: Snowflake
): Promise<StickerSurgeResponse> => {
  const res = await stickerSurgeAPI(
    {
      method: "PATCH",
      url: `${process.env.APP_URL}/api/guilds/${guild.id}/sticker-user-role`,
      data: {
        listMode,
        whitelistRole: listMode === "whitelist" ? roleId : null,
        blacklistRole: listMode === "blacklist" ? roleId : null,
      },
      headers: { Authorization: BOT_AUTH, "Author-Id": userId },
    },
    guild
  );

  return res;
};

const togglePersonalStickersAllowed = async (
  guild: Guild,
  userId: Snowflake
): Promise<StickerSurgeResponse> => {
  let res = await getGuildInfo(guild);

  if (res.status === Status.FAILED) {
    return res;
  }

  const guildInfo = res.data;

  res = await stickerSurgeAPI({
    method: "PATCH",
    url: `${process.env.APP_URL}/api/guilds/${guild.id}/personal-stickers-allowed`,
    data: { personalStickersAllowed: !guildInfo.personalStickersAllowed },
    headers: { Authorization: BOT_AUTH, "Author-Id": userId },
  });

  return res;
};

const usePackSticker = async (
  details: StickerMessageDetails,
  encodedStickerName: string
): Promise<Sticker> => {
  const [guildInfoResult, userInfoResult] = await Promise.all([
    getGuildInfo(details.guild),
    getUserInfo(details.userId),
  ]);

  const guildPacks = guildInfoResult.data?.stickerPacks ?? [];
  const userPacks = userInfoResult.data?.stickerPacks ?? [];
  const allPacks = [...guildPacks, ...userPacks];

  if (!allPacks.includes(details.packKey)) return null;

  const res = await stickerSurgeAPI({
    method: "POST",
    url: `${process.env.APP_URL}/api/sticker-packs/${details.packKey}/stickers/${encodedStickerName}/uses`,
    headers: { Authorization: BOT_AUTH },
  });

  if (res.status === Status.FAILED) {
    return null;
  }

  return res.data;
};

const useCustomSticker = async (
  details: StickerMessageDetails,
  encodedStickerName: string
): Promise<Sticker> => {
  let res: StickerSurgeResponse;

  switch (details.type) {
    case "guild":
      res = await stickerSurgeAPI({
        method: "POST",
        url: `${process.env.APP_URL}/api/guilds/${details.guild.id}/stickers/${encodedStickerName}/uses`,
        headers: { Authorization: BOT_AUTH },
      });
      break;

    case "user":
      res = await stickerSurgeAPI({
        method: "POST",
        url: `${process.env.APP_URL}/api/users/${details.userId}/stickers/${encodedStickerName}/uses`,
        headers: { Authorization: BOT_AUTH },
      });
      break;
    default:
      res = { status: Status.FAILED };
      break;
  }

  if (res.status === Status.FAILED) {
    return null;
  }

  return res.data;
};

const useSticker = async (details: StickerMessageDetails): Promise<Sticker> => {
  const encodedStickerName = encodeURIComponent(details.name);

  switch (details.type) {
    case "guild":
    case "user":
      return await useCustomSticker(details, encodedStickerName);
    case "sticker-pack":
      return await usePackSticker(details, encodedStickerName);
    default:
      return null;
  }
};

export default {
  getGuild,
  getGuildInfo,
  getPrefix,
  createGuild,
  deactivateGuild,
  updateGuild,
  createSticker,
  deleteSticker,
  setPrefix,
  setManagerRole,
  addPack,
  removePack,
  updateAllowLists,
  togglePersonalStickersAllowed,
  useSticker,
};
