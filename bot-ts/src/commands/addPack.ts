import { Command } from "discord-akairo";
import { Message } from "discord.js";
import stickerSurge from "../services/stickerSurge";
import respondToCommand from "../utils/respondToCommand";
import userStickerPerms from "../utils/userStickerPerms";
import "../config";

const COMMAND_NAME = "addPack";

/**
 * Map of error messages for this command
 */
const errorMap = {
  "Sticker Pack not found": `There's no sticker pack with that prefix. Make sure you're using the sticker pack *prefix*, not the sticker pack *name*.\nYou can view all available sticker packs here: <${process.env.APP_URL}/sticker-packs>\nClick the "Use This Pack" button on the website for help.`,
  "Sticker Pack is unlisted": "That sticker pack is no longer available.",
  Unauthorized: `You do not have permission to add sticker packs.`,
  "Pack has not been published":
    "That sticker pack has not been published yet.",
  "already has that Sticker Pack":
    "This server is already using that sticker pack.",
};

class AddPackCommand extends Command {
  constructor() {
    super(COMMAND_NAME, {
      aliases: [COMMAND_NAME, "add-pack", "ap"],
      channel: "guild",
      description: `Add a sticker pack for anyone on this server to use. [View all available packs](${process.env.APP_URL}/sticker-packs)`,
      clientPermissions: ["SEND_MESSAGES"],
      args: [
        {
          id: "packPrefix",
          type: "string",
          prompt: {
            start:
              "What is the **pack prefix** of the sticker pack you'd like to add?",
            retry: "Sorry, that's not a valid pack prefix. Please try again.",
          },
        },
      ],
    });
  }

  async exec(message: Message, args) {
    const { canManage } = await userStickerPerms(message.guild, message.member);

    if (!canManage) {
      return message.channel.send(
        "You do not have permission to add sticker packs in this server."
      );
    }

    const result = await stickerSurge.addPack(
      message.guild,
      message.author.id,
      args.packPrefix
    );

    const viewLink = `${process.env.APP_URL}/server/${message.guild.id}#${args.packPrefix}`;

    await respondToCommand({
      commandName: COMMAND_NAME,
      successMessage: `Successfully added the **${result.data?.packName}** Sticker Pack!\nClick here to view the stickers in this pack: <${viewLink}>`,
      message,
      result,
      errorMap,
    });
  }
}

export default AddPackCommand;
