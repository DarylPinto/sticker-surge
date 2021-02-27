import { Command } from "discord-akairo";
import { Message } from "discord.js";
import stickerSurge from "../services/stickerSurge";
import respondToCommand from "../utils/respondToCommand";
import getRoleId from "../utils/getRoleId";
import "../config";
import escapePrefix from "../utils/escapePrefix";
import getCommandPrefixForMessage from "../utils/getCommandPrefixForMessage";

const COMMAND_NAME = "blacklist";

/**
 * Map of error messages for this command
 */
const errorMap = {
  Unauthorized: `You must have permission to manage the server in order to use this command.`,
};

class BlacklistCommand extends Command {
  constructor() {
    super(COMMAND_NAME, {
      aliases: [COMMAND_NAME, "black-list", "blocklist", "block-list", "bl"],
      channel: "guild",
      description:
        "Set a role to be blocked from using stickers on this server.",
      clientPermissions: ["SEND_MESSAGES"],
      userPermissions: ["MANAGE_GUILD"],
      args: [
        {
          id: "newRole",
          type: "role",
          prompt: {
            start:
              "What is the one role that should be blocked from using stickers on this server?",
            retry: "Sorry, that's not a valid role. Please try again.",
          },
        },
      ],
    });
  }

  async exec(message: Message, args) {
    const { roleId, isEveryoneRole } = getRoleId(args.newRole);

    if (isEveryoneRole) {
      return message.channel.send("You cannot blacklist everyone.");
    }

    const result = await stickerSurge.updateAllowLists(
      message.guild,
      message.author.id,
      "blacklist",
      roleId
    );

    const prefix = await getCommandPrefixForMessage(message, this.handler);
    const escapedPrefix = escapePrefix(prefix);

    await respondToCommand({
      commandName: COMMAND_NAME,
      successMessage: `All users __without__ the role **${args.newRole.name}** are now able to send stickers on this server.\nTo restore default behavior, use: **${escapedPrefix}whitelist everyone**`,
      message,
      result,
      errorMap,
    });
  }
}

export default BlacklistCommand;
