import { Guild } from "discord.js";
import { Listener } from "discord-akairo";
import stickerSurge from "../services/stickerSurge";
import handleListener from "../utils/handleListener";

const LISTENER_NAME = "guildDelete";

class GuildDeleteListener extends Listener {
  constructor() {
    super(LISTENER_NAME, {
      emitter: "client",
      event: LISTENER_NAME,
    });
  }

  async exec(guild: Guild) {
    const result = await stickerSurge.deactivateGuild(guild);
    handleListener({
      successLogMessage: `Guild ${guild.id} deactivated!`,
      listenerName: LISTENER_NAME,
      result,
    });
  }
}

export default GuildDeleteListener;
