import Topgg from "@top-gg/sdk";
import logger from "../utils/logger";
import { Client } from "discord.js";
import "../config";

/**
 * Automatically post stats to top.gg
 *
 * I'd like to use the auotposter, but it's got a bug that breaks TS at the moment:
 * https://github.com/jpbberry/topgg-autoposter/issues/1
 */
const autopost = (client: Client) => {
  if (process.env.TOPGG_ENABLED && process.env.TOPGG_API_KEY) {
    const api = new Topgg.Api(process.env.TOPGG_API_KEY);

    setInterval(() => {
      api.postStats({
        serverCount: client.guilds.cache.size,
        shardId: client.shard.ids[0],
        shardCount: client.options.shardCount,
      });
    }, 1000 * 60 * 30);

    logger.info({
      messsage: `Automatically posting stats to top.gg every 30 minutes`,
    });
  }
};

export default {
  autopost,
};
