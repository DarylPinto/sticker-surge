import { Status, StickerSurgeResponse } from "../services/stickerSurge";
import logger from "./logger";

const handleListener = ({
  result,
  successLogMessage,
  listenerName,
  logLevel = "info",
}: {
  successLogMessage: string;
  logLevel?: string;
  listenerName: string;
  result: StickerSurgeResponse;
}) => {
  if (result.status === Status.FAILED) {
    logger.error({ message: result.errorMessage });
    return;
  }
  logger.log(logLevel, {
    message: successLogMessage,
    meta: {
      listenerName,
    },
  });
};

export default handleListener;
