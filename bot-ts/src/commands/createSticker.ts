import { Command } from "discord-akairo";
import stickerSurge from "../services/stickerSurge";
import { Message, MessageAttachment } from "discord.js";
import "../config";
import respondToCommand from "../utils/respondToCommand";

const COMMAND_NAME = "createSticker";

/**
 * Get map of error messages for this command
 *
 * @param stickerName - Name attempted to be used for the created sticker
 */
const makeErrorMap = (stickerName: string) => ({
  "already has a custom sticker with that name":
    "There's already a sticker with that name.",
  Unauthorized: `You do not have permission to create stickers for everyone on this server.\nIf you want to create your own stickers log into the web dashboard at: ${process.env.APP_URL}`,
  "Sticker name already in use by an emoji": `Sticker name already in use by an emoji: :${stickerName}:`,
  "Sticker name must contain lowercase letters and numbers only":
    "Sticker name must contain lowercase letters and numbers only.",
  "Sticker name cannot be longer than 20 characters":
    "Sticker name cannot be longer than 20 characters.",
  "User has reached maximum amount of custom stickers":
    "You already have too many custom stickers.",
  "Guild has reached maximum amount of custom stickers":
    "This server already has too many custom stickers.",
});

/**
 * Whether a message attachment is valid to create a sticker with
 *
 * @param attachment - Message attachment
 */
const attachmentIsValid = (attachment: MessageAttachment): boolean => {
  const validAttachmentTypes = ["png", "jpg", "jpeg", "webp"];
  const attached = attachment.attachment as string;
  return validAttachmentTypes.some((fileType) => attached.endsWith(fileType));
};

class CreateStickerCommand extends Command {
  constructor() {
    super(COMMAND_NAME, {
      aliases: [COMMAND_NAME, "create-sticker", "cs"],
      channel: "guild",
      description: "Create a custom sticker for anyone on this server to use.",
      clientPermissions: ["SEND_MESSAGES"],
    });
  }

  async *args(message) {
    const messageContainsValidAttachment = message.attachments.some(
      attachmentIsValid
    );

    const stickerName = yield {
      id: "stickerName",
      type: "string",
      prompt: {
        start: "What would you like to name the sticker?",
        retry: "Sorry, that's not a valid name. Please try again.",
      },
    };

    if (!messageContainsValidAttachment) {
      const stickerUrl = yield {
        id: "stickerUrl",
        type: "url",
        prompt: {
          start: "What image URL would you like to create this sticker from?",
          retry: "Sorry, that's not a valid image URL. Please try again.",
        },
      };

      return { stickerName, stickerUrl };
    } else {
      return { stickerName };
    }
  }

  async exec(message: Message, args) {
    const stickerUrl =
      args.stickerUrl || message.attachments.find(attachmentIsValid).url;

    const stickerName = args.stickerName.toLowerCase().replace(/(:|-)/g, "");

    const result = await stickerSurge.createSticker(
      message.guild,
      message.author.id,
      stickerName,
      stickerUrl
    );

    await respondToCommand({
      commandName: COMMAND_NAME,
      successMessage: `\`:${result.data?.name}:\` sticker created!`,
      message,
      result,
      errorMap: makeErrorMap(stickerName),
    });
  }
}

export default CreateStickerCommand;
