import { Command } from "discord-akairo";
import { Message } from "discord.js";
import stickerSurge from "../services/stickerSurge";
import respondToCommand from "../utils/respondToCommand";
import "../config";

const COMMAND_NAME = "togglePersonalStickers";

/**
 * Map of error messages for this command
 */
const errorMap = {
  Unauthorized: `You must have permission to manage the server in order to use this command.`,
};

class TogglePersonalStickersCommand extends Command {
  constructor() {
    super(COMMAND_NAME, {
      aliases: [COMMAND_NAME, "toggle-personal-stickers", "tps"],
      channel: "guild",
      description:
        "Toggle the ability to use personal stickers on this server.",
      clientPermissions: ["SEND_MESSAGES"],
      userPermissions: ["MANAGE_GUILD"],
    });
  }

  async exec(message: Message) {
    const result = await stickerSurge.togglePersonalStickersAllowed(
      message.guild,
      message.author.id
    );

    const successMessage = result.data?.personalStickersAllowed
      ? "Personal stickers are now **allowed** on this server."
      : "Personal stickers are now **disallowed** on this server.";

    await respondToCommand({
      commandName: COMMAND_NAME,
      successMessage,
      message,
      result,
      errorMap,
    });
  }
}

export default TogglePersonalStickersCommand;
