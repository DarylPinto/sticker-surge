import { Command } from "discord-akairo";
import { Message } from "discord.js";
import stickerSurge from "../services/stickerSurge";
import respondToCommand from "../utils/respondToCommand";
import "../config";
import userStickerPerms from "../utils/userStickerPerms";

const COMMAND_NAME = "removePack";

/**
 * Map of error messages for this command
 */
const errorMap = {
  "Sticker Pack not found": `There's no sticker pack with that prefix.\nYou can view all available sticker packs here: <${process.env.APP_URL}/sticker-packs>`,
  "Sticker Pack is unlisted": "That sticker pack is no longer available.",
  Unauthorized: `You do not have permission to remove sticker packs.`,
  "does not have a Sticker Pack": "This server is not using that sticker pack.",
};

class RemovePackCommand extends Command {
  constructor() {
    super(COMMAND_NAME, {
      aliases: [COMMAND_NAME, "remove-pack", "rp"],
      channel: "guild",
      description: "Remove a sticker pack from this server.",
      clientPermissions: ["SEND_MESSAGES"],
      args: [
        {
          id: "packPrefix",
          type: "string",
          prompt: {
            start:
              "What is the **pack prefix** of the sticker pack you'd like to remove?",
            retry: "Sorry, that's not a valid pack prefix. Please try again.",
          },
        },
      ],
    });
  }

  async exec(message: Message, args) {
    const { canManage } = await userStickerPerms(message);

    if (!canManage) {
      return message.channel.send(
        "You do not have permission to remove sticker packs from this server."
      );
    }

    const result = await stickerSurge.removePack(
      message.guild,
      message.author.id,
      args.packPrefix
    );

    await respondToCommand({
      commandName: COMMAND_NAME,
      successMessage: `Successfully removed the **${result.data?.packName}** Sticker Pack from this server!`,
      message,
      result,
      errorMap,
    });
  }
}

export default RemovePackCommand;
