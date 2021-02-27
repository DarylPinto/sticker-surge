import { createLogger, format, transports } from "winston";

const { combine, timestamp, prettyPrint } = format;

const logger = createLogger({
  level: "info",
  format: combine(
    timestamp({
      format: () =>
        new Date().toLocaleString("en-US", { timeZone: "America/New_York" }),
    }),
    prettyPrint()
  ),
  transports: [new transports.Console()],
});

export default logger;
