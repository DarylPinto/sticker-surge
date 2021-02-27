import stickerSurge, { Status } from "../services/stickerSurge";
import logger from "./logger";
import { Guild, GuildMember } from "discord.js";

/**
 * Calculate user sticker permissions. This function DOES NOT
 * read user IDs from the sticker surge API, as it is broken because of Discord.
 *
 * Instead it reads directly from the user within Discord itself.
 */
const userStickerPerms = async (guild: Guild, guildMember: GuildMember) => {
  const userId = guildMember.user.id;
  const isGuildManager = guildMember.hasPermission("MANAGE_GUILD");
  const userRoles = guildMember.roles.cache.keyArray();

  const { status, data: guildInfo } = await stickerSurge.getGuildInfo(guild);

  if (status === Status.FAILED) {
    // Now that `getGuildInfo` creates guilds on 404,this error
    // should never appear. Still keeping it around just in case.
    logger.error({
      message:
        "Unable to fetch guild from stickerSurgeService while calculating permissions",
      meta: {
        guild: guild.id,
        user: userId,
      },
    });
    return { canManage: false, canSend: false };
  }

  const {
    stickerManagers: { roleId: stickerManagerRole },
    listMode,
    whitelist: { roleId: whitelistRole },
    blacklist: { roleId: blacklistRole },
  } = guildInfo;

  //Base permissions
  let isBlacklisted =
    !isGuildManager &&
    listMode === "blacklist" &&
    userRoles.includes(blacklistRole);

  let isWhitelisted =
    isGuildManager ||
    whitelistRole === "@everyone" ||
    (listMode === "whitelist" && userRoles.includes(whitelistRole));

  let isStickerManager =
    isGuildManager ||
    stickerManagerRole === "@everyone" ||
    userRoles.includes(stickerManagerRole);

  //If whitelisted and blacklisted, user should be blacklisted
  if (!isGuildManager && isWhitelisted && isBlacklisted) {
    isBlacklisted = true;
    isWhitelisted = false;
  }

  //Calculate final permissions
  let canManage = isGuildManager || (isStickerManager && !isBlacklisted);
  let canSend = isGuildManager || (isWhitelisted && !isBlacklisted);

  return { canManage, canSend };
};

/**
 * CODE: TODO-101
 * TEMPORARY:
 * UNTIL DISCORD FIXES MY BOT'S PERMISSIONS.
 *
 * Original functionality userStickerPermsFunctionality
 */
const OLD_userStickerPerms = async (guild: Guild, userId: string) => {
  const { status, data: guildInfo } = await stickerSurge.getGuildInfo(guild);

  if (status === Status.FAILED) {
    logger.error({
      message:
        "Unable to fetch guild from stickerSurgeService while calculating permissions",
      meta: {
        guild: guild.id,
        user: userId,
      },
    });
    return { canManage: false, canSend: false };
  }

  const {
    guildManagerIds,
    stickerManagers: { roleId: stickerManagerRole, userIds: stickerManagerIds },
    listMode,
    whitelist: { roleId: whitelistRole, userIds: whitelistIds },
    blacklist: { roleId: blacklistRole, userIds: blacklistIds },
  } = guildInfo;

  //Base permissions
  let isGuildManager = guildManagerIds.includes(userId);

  let isBlacklisted =
    !isGuildManager &&
    listMode === "blacklist" &&
    blacklistIds.includes(userId);

  let isWhitelisted =
    isGuildManager ||
    whitelistRole === "@everyone" ||
    (listMode === "whitelist" && whitelistIds.includes(userId));

  let isStickerManager =
    isGuildManager ||
    stickerManagerRole === "@everyone" ||
    stickerManagerIds.includes(userId);

  //If whitelisted and blacklisted, user should be blacklisted
  if (!isGuildManager && isWhitelisted && isBlacklisted) {
    isBlacklisted = true;
    isWhitelisted = false;
  }

  //Calculate final permissions
  let canManage = isGuildManager || (isStickerManager && !isBlacklisted);
  let canSend = isGuildManager || (isWhitelisted && !isBlacklisted);

  return { canManage, canSend };
};

export default userStickerPerms;
