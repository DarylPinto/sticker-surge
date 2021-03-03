import { Command } from "discord-akairo";
import { Message } from "discord.js";
import stickerSurge from "../services/stickerSurge";
import respondToCommand from "../utils/respondToCommand";
import { EMBED_COLOR } from "../data/constants";
import escapePrefix from "../utils/escapePrefix";
import logger from "../utils/logger";
import "../config";

const COMMAND_NAME = "help";

const discordLink = "https://discord.gg/HNFmKsE";
const botInviteLink = `https://discordapp.com/oauth2/authorize?client_id=${process.env.DISCORD_APP_ID}&scope=bot&permissions=${process.env.DISCORD_BOT_PERMS}`;
const botVoteLink = `https://top.gg/bot/${process.env.DISCORD_APP_ID}`;

class HelpCommand extends Command {
  constructor() {
    super(COMMAND_NAME, {
      aliases: [COMMAND_NAME, "info", "h"],
      channel: "guild",
      description: "Get help and general info.",
      clientPermissions: ["EMBED_LINKS", "SEND_MESSAGES"],
    });
  }

  async exec(message: Message) {
    const result = await stickerSurge.getGuild(message.guild);

    let responseMessage = "";
    let responseMessageOptions = {};

    try {
      const {
        commandPrefix,
        listMode,
        whitelist: { roleId: whitelistRoleId },
        blacklist: { roleId: blacklistRoleId },
        stickerManagers: { roleId: stickerManagerRoleId },
        personalStickersAllowed,
        customStickers,
      } = result.data;

      const escapedPrefix = escapePrefix(commandPrefix);
      const roleManager = message.guild.roles;

      const stickerManagerRoleName =
        stickerManagerRoleId === "@everyone"
          ? "Everyone"
          : roleManager.resolve(stickerManagerRoleId).name;

      let whoCanSend;
      if (listMode === "whitelist") {
        whoCanSend =
          whitelistRoleId === "@everyone"
            ? "Everyone"
            : `Anyone with the role *${
                roleManager.resolve(whitelistRoleId).name
              }*`;
      } else {
        const blacklistRoleName = roleManager.resolve(blacklistRoleId).name;
        whoCanSend = `Anyone __without__ the role *${blacklistRoleName}*`;
      }

      responseMessageOptions = {
        embed: {
          color: EMBED_COLOR,
          fields: [
            {
              name: "Sticker Surge",
              value: `
						To view a list of commands, type: **${escapedPrefix}commands**
						[View available sticker packs](${process.env.APP_URL}/sticker-packs)
						[View guide](${process.env.APP_URL}/docs)
						.
					`.replace(/\t/g, ""),
            },
            {
              name: message.guild.name,
              value: `
						Command Prefix: ${escapedPrefix}
						Who can use stickers: ${whoCanSend}
						Sticker Manager Role: ${stickerManagerRoleName}
						Personal stickers allowed: ${personalStickersAllowed ? "Yes" : "No"}
						Custom Stickers: ${customStickers.length}
						[View Stickers](${process.env.APP_URL}/server/${message.guild.id})
						.
					`.replace(/\t/g, ""),
            },
            {
              name: "Misc. Links",
              value: `
						[Join our Discord](${discordLink})
						[Add bot to another server](${botInviteLink})
						[Enjoy the bot? Upvote it on top.gg <3](${botVoteLink})
						___
					`.replace(/\t/g, ""),
            },
          ],
          footer: { text: "Created by: DRL#1287" },
        },
      };
    } catch (err) {
      logger.error({
        message: "Error occured while generating *help* command message",
        meta: {
          error: { message: err.message, stack: err.stack },
          botCommand: COMMAND_NAME,
          guild: message.guild.id,
          user: message.author.id,
          message: { id: message.id, content: message.content },
        },
      });

      responseMessage = "Something unexpected happened";
    }

    await respondToCommand({
      commandName: COMMAND_NAME,
      successMessage: responseMessage,
      successMessageOptions: responseMessageOptions,
      message,
      result,
      errorMap: {},
    });
  }
}

export default HelpCommand;
