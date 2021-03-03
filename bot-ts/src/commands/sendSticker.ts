import { Command } from "discord-akairo";
import { Message, TextChannel } from "discord.js";
import {
  getStickerWebhook,
  parseStickerMessage,
  postSticker,
} from "../utils/sendStickerUtils";
import userStickerPerms from "../utils/userStickerPerms";
import logger from "../utils/logger";
import stickerSurge from "../services/stickerSurge";
import "../config";

const COMMAND_NAME = "sendSticker";

// Sticker detection regex
const sticker_regex = () =>
  /^((:|;)[a-zA-Zа-яёА-ЯЁ0-9-]+(:|;)|-[a-zA-Zа-яёА-ЯЁ0-9-]+)$/g;

class SendSticker extends Command {
  constructor() {
    super(COMMAND_NAME, {
      regex: sticker_regex(),
      channel: "guild",
      description: "Sends a sticker",
      clientPermissions: ["SEND_MESSAGES"],
    });
  }

  async exec(message: Message) {
    try {
      const stickerWebhook = await getStickerWebhook(message, this.client);
      const messageDetails = parseStickerMessage(message);
      const sticker = await stickerSurge.useSticker(messageDetails);

      // If no sticker exists that matches the command, do nothing.
      if (sticker === null) return;

      // If personal stickers are disabled:
      if (sticker.groupType === "user") {
        const res = await stickerSurge.getGuildInfo(message.guild);
        // Note: 'res' could contain an 'errorMessage' if it fails to connect to
        // stickerSurge api, but it should be safe to ignore it here
        if (!res.data?.personalStickersAllowed) {
          await message.channel.send(
            "Personal stickers are not allowed on this server."
          );
          return;
        }
      }

      // Verify user's permissions to send stickers
      const { canSend } = await userStickerPerms(message.guild, message.member);
      if (!canSend) {
        await message.channel.send(
          "You do not have permission to send stickers on this server."
        );
        return;
      }

      // Post the sticker
      const stickerPostedSuccessfully = postSticker(
        message,
        sticker,
        stickerWebhook
      );

      // Delete original message if we have permission to
      const botCanDelete = (message.channel as TextChannel)
        .permissionsFor(message.guild.me)
        .has("MANAGE_MESSAGES");

      if (stickerPostedSuccessfully && botCanDelete) {
        try {
          await message.delete();
        } catch (err) {}
      }
    } catch (err) {
      logger.error({
        message: "Error occured in sendSticker command",
        meta: {
          error: { message: err.message, stack: err.stack },
          botCommand: COMMAND_NAME,
          guild: message.guild.id,
          user: message.author.id,
          message: { id: message.id, content: message.content },
        },
      });
    }
  }
}

export default SendSticker;
