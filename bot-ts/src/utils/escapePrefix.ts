/**
 * Escape new prefix to avoid issues with Discord formatting
 * Note: This is legacy code, I can't remember how it works
 *
 * @param prefix - Command Prefix
 */
const escapePrefix = (prefix: string): string =>
  prefix.replace(/[^a-zA-Zа-яёА-ЯЁ0-9]/g, "\\$&");

export default escapePrefix;
