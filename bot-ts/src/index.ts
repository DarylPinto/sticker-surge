import { ShardingManager } from "discord.js";
import logger from "./utils/logger";
import "./config";

const BOT_FILE_PATH = "./dist/bot.js";

// Create your ShardingManger instance
export const manager = new ShardingManager(BOT_FILE_PATH, {
  token: process.env.DISCORD_APP_BOT_TOKEN,
  mode: "worker",
  totalShards: "auto"
});

// Emitted when a shard is created
manager.on("shardCreate", (shard) =>
  logger.info({ messsage: `Shard ${shard.id} launched` })
);

// Spawn your shards
manager.spawn();
