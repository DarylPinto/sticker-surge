import { Webhook, Client, Collection, TextChannel, Message } from "discord.js";
import logger from "./logger";
import { StickerMessageDetails, Sticker } from "../services/stickerSurge";

export const postSticker = async (
  message: Message,
  sticker: Sticker,
  webhook: Webhook
): Promise<boolean> => {
  // Flag for if sticker was properly sent
  let success = false;

  if (!webhook) {
    // No webhook available? send text sticker
    success = await postTextSticker(message, sticker);
  } else {
    // Webhook available? try webhook sticker
    success = await postWebhookSticker(message, sticker, webhook);

    // webhook sticker failed? text sticker
    if (!success) {
      success = await postTextSticker(message, sticker);
    }
  }

  // If nothing succeeded, there's literally no way to post a sticker
  if (!success) {
    await message.channel.send(
      "This bot requires permission to either **Manage Webhooks** or **Attach Files** in _all_ channels.\nStickers cannot be sent otherwise."
    );
  }

  return success;
};

export const postTextSticker = async (
  message: Message,
  sticker: Sticker
): Promise<boolean> => {
  try {
    await message.channel.send(`**${message.member.displayName}:**`, {
      files: [sticker.url],
    });

    return true;
  } catch (err) {
    logger.debug({
      message: "Unable to send text sticker, attachments are likely blocked",
      meta: {
        guild: message.guild.id,
        user: message.author.id,
        usersMessage: message.content,
      },
    });

    return false;
  }
};

export const postWebhookSticker = async (
  message: Message,
  sticker: Sticker,
  webhook: Webhook
): Promise<boolean> => {
  try {
    await webhook.edit({
      name: message.member.displayName,
      avatar: resizeAvatarURL(message.author.displayAvatarURL(), 128),
      channel: message.channel,
    });

    await webhook.send({ files: [sticker.url] });

    return true;
  } catch (err) {
    logger.debug({
      message: "Unable to send webhook sticker, likely unable to edit webhooks",
      meta: {
        guild: message.guild.id,
        user: message.author.id,
        usersMessage: message.content,
      },
    });

    return false;
  }
};

export const parseStickerMessage = (
  message: Message
): StickerMessageDetails => {
  let str = message.content.replace(/(:|;)/g, "");

  const type = str.includes("-")
    ? str.startsWith("-")
      ? "user"
      : "sticker-pack"
    : "guild";

  const splitStr = str.split("-");

  return {
    name: splitStr[splitStr.length - 1],
    type,
    packKey: type === "sticker-pack" ? splitStr[0] : null,
    guild: message.guild,
    userId: message.author.id,
  };
};

/**
 * Get the sticker webhook.
 * Returns null if unable to retrieve
 *
 * Yes, this function is ugly as sin. Don't worry about it.
 * It just needs to work and handle errors nicely
 *
 * @param channel - Channel in the guild we wish to retrieve the webhook for
 * @param client - Discord.js Client
 */
export const getStickerWebhook = async (
  message: Message,
  client: Client
): Promise<Webhook> => {
  const channel = message.channel as TextChannel;
  let hooks: Collection<string, Webhook>;

  // Attempt to fetch all webhooks in the guild
  try {
    hooks = await channel.guild.fetchWebhooks();
  } catch (err) {
    logger.debug({
      message: "Unable to fetch webhooks",
      meta: {
        error: { message: err.message },
        guild: message.guild.id,
        channel: message.channel.id,
        user: message.author.id,
      },
    });

    return null;
  }

  // Find the webhook created by this bot
  let hook = hooks.find((hook) => {
    // Checking if hook.owner is undefined is necessary
    // for some (old?) webhooks, as they don't have that property.
    if (!hook.owner) return null;

    // @ts-ignore
    const hookOwnerId = hook.owner?.id;
    return hookOwnerId === client.user.id;
  });

  // Return it if it exists
  if (hook) return hook;

  // If it doesn't exist, make a new one
  try {
    hook = await channel.createWebhook("Sticker Surge", {
      avatar: client.user.displayAvatarURL(),
    });
  } catch (err) {
    logger.debug({
      message: "Unable to create a new sticker webhook",
      meta: {
        error: { message: err.message },
        guild: message.guild.id,
        channel: message.channel.id,
        user: message.author.id,
      },
    });

    return null;
  }

  return hook;
};

/**
 * Adds a `size` querystring to the end of an avatarURL
 */
const resizeAvatarURL = (avatarURL: string, size: number): string => {
  let baseURL = avatarURL.includes("?")
    ? avatarURL.substr(0, avatarURL.indexOf("?"))
    : avatarURL;

  return `${baseURL}?size=${size}`;
};
