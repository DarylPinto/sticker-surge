import { Guild } from "discord.js";
import { Listener } from "discord-akairo";
import stickerSurge, { Status } from "../services/stickerSurge";
import handleListener from "../utils/handleListener";

const LISTENER_NAME = "guildCreate";
class GuildCreateListener extends Listener {
  constructor() {
    super(LISTENER_NAME, {
      emitter: "client",
      event: LISTENER_NAME,
    });
  }

  async exec(guild: Guild) {
    const result = await stickerSurge.createGuild(guild);
    handleListener({
      successLogMessage: `Guild ${guild.id} added!`,
      listenerName: LISTENER_NAME,
      result,
    });
  }
}

export default GuildCreateListener;
