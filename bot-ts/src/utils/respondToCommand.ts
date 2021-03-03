import { Message, MessageOptions, MessageAdditions } from "discord.js";
import stickerSurge, {
  Status,
  StickerSurgeResponse,
} from "../services/stickerSurge";
import logger from "./logger";

interface RespondToCommandOptions {
  commandName: string;
  message: Message;
  result: StickerSurgeResponse;
  errorMap: Object;
  successMessage: string;
  successMessageOptions?: MessageOptions;
}

/**
 * Handle responding to a command
 *
 * @param options.commandName - Name of the command we're responding to
 * @param options.message - Discord message we're responding to
 * @param options.result - Response from StickerSurgeService
 * @param options.errorMap - Map of error message fragments
 * @param options.successMessage - Message to send when command executes successfully
 */
const respondToCommand = async ({
  commandName,
  message,
  result,
  errorMap,
  successMessage,
  successMessageOptions = {},
}: RespondToCommandOptions) => {
  if (result.status === Status.SUCCESS) {
    return message.channel.send(successMessage, successMessageOptions);
  } else {
    // See if the error message from stickerSurgeService matches
    // anything in errorMap. If so, respond to the user
    for (const [errMessageFragment, botErrorMessage] of Object.entries(
      errorMap
    )) {
      if (result.errorMessage.includes(errMessageFragment)) {
        await message.channel.send(botErrorMessage);
        return;
      }
    }

    // If for some reason the bot is in a guild, but sticker surge
    // doesn't know about it: create the guild
    if (result.errorMessage.includes("Guild not found")) {
      await stickerSurge.createGuild(message.guild);
    }

    logger.error({
      message: "Error occured with no corresponding 'errorMap' message.",
      meta: {
        botCommand: commandName,
        stickerSurgeServiceResult: result,
        guild: message.guild.id,
        user: message.author.id,
        message: { id: message.id, content: message.content },
      },
    });
    return message.channel.send(
      "Sorry, something unexpected happened. Please try again."
    );
  }
};

export default respondToCommand;
