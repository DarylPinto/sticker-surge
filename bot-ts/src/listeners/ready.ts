import { Listener } from "discord-akairo";
import logger from "../utils/logger";
import topggService from "../services/topgg";

const LISTENER_NAME = "ready";

class ReadyListener extends Listener {
  constructor() {
    super(LISTENER_NAME, {
      emitter: "client",
      event: LISTENER_NAME,
    });
  }

  async exec() {
    topggService.autopost(this.client);
 
    await this.client.user.setPresence({
      activity: { name: "stickersurge.com" },
    });

    logger.info({ message: "Sticker Surge bot is online!" });
  }
}

export default ReadyListener;
