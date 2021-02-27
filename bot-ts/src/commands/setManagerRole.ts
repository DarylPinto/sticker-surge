import { Command } from "discord-akairo";
import { Message } from "discord.js";
import stickerSurge from "../services/stickerSurge";
import respondToCommand from "../utils/respondToCommand";
import getRoleId from "../utils/getRoleId";
import "../config";

const COMMAND_NAME = "setManagerRole";

/**
 * Map of error messages for this command
 */
const errorMap = {
  "Role name must be less than 30 characters":
    "Role name must be less than 30 characters.",
  Unauthorized: `You must have permission to manage the server in order to use this command.`,
};

class SetManagerRoleCommand extends Command {
  constructor() {
    super(COMMAND_NAME, {
      aliases: [COMMAND_NAME, "set-manager-role", "smr"],
      channel: "guild",
      description:
        "Set the role required to create stickers and manage sticker packs on this server.",
      clientPermissions: ["SEND_MESSAGES"],
      userPermissions: ["MANAGE_GUILD"],
      args: [
        {
          id: "newRole",
          type: "role",
          prompt: {
            start:
              "What role should be required to manage Sticker Surge in this server?",
            retry: "Sorry, that role does not exist. Please try again.",
          },
        },
      ],
    });
  }

  async exec(message: Message, args) {
    const { roleId, isEveryoneRole } = getRoleId(args.newRole);

    const result = await stickerSurge.setManagerRole(
      message.guild,
      message.author.id,
      roleId
    );

    const successMessage = isEveryoneRole
      ? "Everyone can now create stickers on this server."
      : `**${args.newRole.name}** is now the role required to create stickers on this server.`;

    await respondToCommand({
      commandName: COMMAND_NAME,
      successMessage,
      message,
      result,
      errorMap,
    });
  }
}

export default SetManagerRoleCommand;
