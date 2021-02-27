import { Command } from "discord-akairo";
import { Message, PermissionResolvable } from "discord.js";
import { EMBED_COLOR } from "../data/constants";
import escapePrefix from "../utils/escapePrefix";
import getCommandPrefixForMessage from "../utils/getCommandPrefixForMessage";
import "../config";

const COMMAND_NAME = "commands";

const excludedCommandIds = ["sendSticker", "debug"];

class ListCommandsCommand extends Command {
  constructor() {
    super(COMMAND_NAME, {
      aliases: [COMMAND_NAME, "c"],
      channel: "guild",
      description: "List commands.",
      clientPermissions: ["SEND_MESSAGES"],
    });
  }

  async exec(message: Message) {
    const prefix = await getCommandPrefixForMessage(message, this.handler);
    const escapedPrefix = escapePrefix(prefix);

    // Convert commands into an array of embed fields
    const fields = this.handler.modules
      .filter((command) => !excludedCommandIds.includes(command.id))
      .filter((command) => {
        const userPermissions = command.userPermissions as PermissionResolvable[];
        if (userPermissions?.includes("MANAGE_GUILD"))
          return message.member.hasPermission("MANAGE_GUILD");
        return true;
      })
      .map((command) => ({
        name: `${escapedPrefix}${command.id}`,
        value: command.description,
      }));

    // Maybe this can be used to sort: https://discord-akairo.github.io/#/docs/main/master/class/Category
    return message.reply(
      `Here is a list of commands: ${process.env.APP_URL}/docs#commands`,
      { embed: { color: EMBED_COLOR, fields } }
    );
  }
}

export default ListCommandsCommand;
