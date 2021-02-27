import { Command } from "discord-akairo";
import { Message } from "discord.js";
import stickerSurge from "../services/stickerSurge";
import respondToCommand from "../utils/respondToCommand";
import escapePrefix from "../utils/escapePrefix";
import "../config";

const COMMAND_NAME = "setPrefix";

/**
 * Map of error messages for this command
 */
const errorMap = {
  "Prefix cannot be longer than 3 characters":
    "Prefix cannot be longer than 3 characters.",
  "Illegal prefix":
    "Prefix cannot contain emoji or any of the following characters: **@ # -**",
  Unauthorized: `You must have permission to manage the server in order to use this command.`,
};

class SetPrefixCommand extends Command {
  constructor() {
    super(COMMAND_NAME, {
      aliases: [COMMAND_NAME, "set-prefix", "prefix", "sp"],
      channel: "guild",
      description: "Set the prefix used to invoke these commands.",
      clientPermissions: ["SEND_MESSAGES"],
      userPermissions: ["MANAGE_GUILD"],
      args: [
        {
          id: "newPrefix",
          type: "string",
          prompt: {
            start:
              "What would you like to use as the new command prefix for Sticker Surge?",
            retry: "Sorry, that's not a valid prefix. Please try again.",
          },
        },
      ],
    });
  }

  async exec(message: Message, args) {
    const newPrefix = args.newPrefix.toLowerCase();
    const escapedNewPrefix = escapePrefix(newPrefix);

    const result = await stickerSurge.setPrefix(
      message.guild,
      message.author.id,
      newPrefix
    );

    await respondToCommand({
      commandName: COMMAND_NAME,
      successMessage: `Sticker Surge commands now begin with **${escapedNewPrefix}**\nType **${escapedNewPrefix}commands** for a list of commands.`,
      message,
      result,
      errorMap,
    });
  }
}

export default SetPrefixCommand;
