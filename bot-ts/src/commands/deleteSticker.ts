import { Command } from "discord-akairo";
import { Message } from "discord.js";
import stickerSurge from "../services/stickerSurge";
import respondToCommand from "../utils/respondToCommand";
import "../config";

const COMMAND_NAME = "deleteSticker";

/**
 * Get map of error messages for this command
 *
 * @param stickerName - Name of the sticker to be deleted
 */
const makeErrorMap = (stickerName: string) => ({
  "does not have a custom sticker with that name": `This server has no custom sticker named: "\`${stickerName}\`"`,
  Unauthorized: `You cannot delete stickers you didn't create.\nIf you want to manage your own custom stickers, log into the web dashboard at: ${process.env.APP_URL}`,
});

class DeleteStickerCommand extends Command {
  constructor() {
    super(COMMAND_NAME, {
      aliases: [COMMAND_NAME, "delete-sticker", "ds"],
      channel: "guild",
      description: "Delete a custom sticker from this server.",
      clientPermissions: ["SEND_MESSAGES"],
      args: [
        {
          id: "stickerName",
          type: "string",
          prompt: {
            start:
              "What's the name of the sticker you would like to delete from this server?",
            retry: "Sorry, that's not a valid sticker name. Please try again.",
          },
        },
      ],
    });
  }

  async exec(message: Message, args) {
    const stickerName = args.stickerName.toLowerCase().replace(/(:|-)/g, "");

    const result = await stickerSurge.deleteSticker(
      message.guild,
      message.author.id,
      stickerName
    );

    await respondToCommand({
      commandName: COMMAND_NAME,
      successMessage: `\`:${stickerName}:\` sticker deleted!`,
      message,
      result,
      errorMap: makeErrorMap(stickerName),
    });
  }
}

export default DeleteStickerCommand;
