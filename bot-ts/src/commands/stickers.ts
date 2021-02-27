import { Command } from "discord-akairo";
import { Message } from "discord.js";
import "../config";

const COMMAND_NAME = "stickers";

class StickersCommand extends Command {
  constructor() {
    super(COMMAND_NAME, {
      aliases: [COMMAND_NAME, "s"],
      channel: "guild",
      description: "View this server's stickers.",
      clientPermissions: ["SEND_MESSAGES"],
    });
  }

  async exec(message: Message) {
    return message.channel.send(
      `To see this server's stickers, click here: ${process.env.APP_URL}/server/${message.guild.id}`
    );
  }
}

export default StickersCommand;
