import { Command } from "discord-akairo";
import { Message } from "discord.js";
import stickerSurge from "../services/stickerSurge";
import respondToCommand from "../utils/respondToCommand";
import getRoleId from "../utils/getRoleId";
import "../config";
import getCommandPrefixForMessage from "../utils/getCommandPrefixForMessage";
import escapePrefix from "../utils/escapePrefix";

const COMMAND_NAME = "whitelist";

/**
 * Map of error messages for this command
 */
const errorMap = {
  Unauthorized: `You must have permission to manage the server in order to use this command.`,
};

class WhitelistCommand extends Command {
  constructor() {
    super(COMMAND_NAME, {
      aliases: [COMMAND_NAME, "white-list", "allowlist", "allow-list", "wl"],
      channel: "guild",
      description: "Set the role required to use stickers on this server.",
      userPermissions: ["MANAGE_GUILD"],
      clientPermissions: ["SEND_MESSAGES"],
      args: [
        {
          id: "newRole",
          type: "role",
          prompt: {
            start:
              "What role should be required to send stickers on this server?",
            retry: "Sorry, that's not a valid role. Please try again.",
          },
        },
      ],
    });
  }

  async exec(message: Message, args) {
    const { roleId, isEveryoneRole } = getRoleId(args.newRole);

    const result = await stickerSurge.updateAllowLists(
      message.guild,
      message.author.id,
      "whitelist",
      roleId
    );

    const prefix = await getCommandPrefixForMessage(message, this.handler);
    const escapedPrefix = escapePrefix(prefix);

    const successMessage = isEveryoneRole
      ? "Everyone can now send stickers on this server!"
      : `**${args.newRole.name}** is now the role required to send stickers on this server.\nTo restore default behavior, use: **${escapedPrefix}whitelist everyone**`;

    await respondToCommand({
      commandName: COMMAND_NAME,
      successMessage,
      message,
      result,
      errorMap,
    });
  }
}

export default WhitelistCommand;
