import { Command } from "discord-akairo";
import { Message } from "discord.js";
import stickerSurge from "../services/stickerSurge";
const COMMAND_NAME = "debug";

class DebugCommand extends Command {
  constructor() {
    super(COMMAND_NAME, {
      aliases: [COMMAND_NAME],
      ownerOnly: true,
      channel: "guild",
      description: "Debugging command",
      clientPermissions: ["SEND_MESSAGES"],
    });
  }

  async exec(message: Message, args) {
    let guild = await stickerSurge.createGuild(message.guild);
    message.reply(JSON.stringify(guild, null, 4));
  }
}

export default DebugCommand;
