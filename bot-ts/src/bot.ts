import {
  AkairoClient,
  CommandHandler,
  InhibitorHandler,
  ListenerHandler,
} from "discord-akairo";
import getCommandPrefixForMessage from "./utils/getCommandPrefixForMessage";
import "./config";

process.on("unhandledRejection", (r) => {
  throw r;
});

const programDir = process.env.NODE_ENV === "production" ? "dist" : "src";

class Client extends AkairoClient {
  commandHandler: CommandHandler;
  inhibitorHandler: InhibitorHandler;
  listenerHandler: ListenerHandler;

  constructor() {
    super({ ownerID: "82161988473454592" }, { disableMentions: "everyone" });

    this.commandHandler = new CommandHandler(this, {
      directory: `./${programDir}/commands`,
      commandUtil: true,
      allowMention: true,
      blockBots: true,
      handleEdits: true,
      prefix: async (message) => {
        const prefix = await getCommandPrefixForMessage(
          message,
          this.commandHandler
        );
        return prefix;
      },
    });

    this.listenerHandler = new ListenerHandler(this, {
      directory: `./${programDir}/listeners/`,
    });

    // Load commands, inhibitors, and listeners
    this.commandHandler.loadAll();
    this.listenerHandler.loadAll();
  }
}

const client = new Client();
client.login(process.env.DISCORD_APP_BOT_TOKEN);
