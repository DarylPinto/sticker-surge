import { CommandHandler } from "discord-akairo";
import { Message } from "discord.js";
import StickerSurge from "../services/stickerSurge";

/**
 * Whether the message contains a command. This useful to determine whether we
 * need to fetch the prefix from the sticker surge API, or if we can just ignore
 * the message all together
 *
 * @param message Discord Message
 * @param commandAliases Array of command aliases
 */
const isMessageCommand = (message: Message, commandAliases: string[]) => {
  const messageWords = message.content.toLowerCase().trim().split(/\s+/);
  const firstWord = messageWords[0];
  const secondWord = messageWords[1] || "";

  return commandAliases.some((command) => {
    const cmd = command.toLowerCase();
    return firstWord.endsWith(cmd) || secondWord.endsWith(cmd);
  });
};

/**
 * NOTE: This function runs on EVERY discord message,
 * so it needs to be as performant as possible
 *
 * @param message - Discord message
 * @param commandHandler - Akairo command handler
 */
const getCommandPrefixForMessage = async (
  message: Message,
  commandHandler: CommandHandler
): Promise<string> => {
  const commandAliases = commandHandler.aliases.keyArray();
  const messageHasCommand = isMessageCommand(message, commandAliases);

  // Only make a request to sticker surge to retrieve the prefix if
  // we're sure that the message has a command
  if (!messageHasCommand || !message.guild) return "$";
  const prefix = await StickerSurge.getPrefix(message.guild);
  return prefix;
};

export default getCommandPrefixForMessage;
