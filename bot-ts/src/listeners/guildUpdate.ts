import { Guild } from "discord.js";
import { Listener } from "discord-akairo";
import stickerSurge from "../services/stickerSurge";
import handleListener from "../utils/handleListener";

const LISTENER_NAME = "gulidUpdate";

class GuildUpdateListener extends Listener {
  constructor() {
    super(LISTENER_NAME, {
      emitter: "client",
      event: LISTENER_NAME,
    });
  }

  async exec(_, guild: Guild) {
    const result = await stickerSurge.updateGuild(guild);
    handleListener({
      successLogMessage: `Guild ${guild.id} updated!`,
      logLevel: "verbose",
      listenerName: LISTENER_NAME,
      result,
    });
  }
}

export default GuildUpdateListener;
