const oauth = require("./oauth.js");
const Cryptr = require("cryptr");
const User = require("../api/models/user-model.js");

const cryptr = new Cryptr(process.env.REFRESH_TOKEN_KEY);

/**
 * Gets access token for a user with one of two methods:
 *
 * 1) If a userID is provided, we check if they have a refresh token
 * stored that we can use to get an access token. If they don't, returns null.
 *
 * 2) If an authorizationCode is provided we exchange that for an access token.
 *
 * This is not a pure function. Upon getting the access token, the `refresh_token` and
 * `token_expiry_time` fields are updated in the db as well.
 *
 * @param {string} userId - ID of the user
 * @param {string} authorizationCode - Oauth authorization Code to exchange for an access token
 *
 * @returns {object} tokenResponse (or null with no auth code or refresh token stored)
 */
const getAccessToken = async ({ userId, authorizationCode }) => {
  let user;
  let refreshToken;

  if (!authorizationCode) {
    user = await User.findOne({ id: userId });
    refreshToken = user.refresh_token.length > 0
      ? cryptr.decrypt(user.refresh_token)
      : null;
  }

  if (!authorizationCode && !refreshToken) return null;

  const tokenRequestBody = authorizationCode
    ? {
        code: authorizationCode,
        scope: ["identify", "guilds"],
        grantType: "authorization_code",
      }
    : {
        refreshToken,
        scope: ["identify", "guilds"],
        grantType: "refresh_token",
      };

  const tokenResponse = await oauth.tokenRequest(tokenRequestBody);

  // Get user's basic info
  const { access_token, refresh_token, expires_in } = tokenResponse;

  const discordUserInfo = await oauth.getUser(access_token);
  const { id } = discordUserInfo;

  // Save important data to db
  let token_expiry_time = new Date();
  token_expiry_time.setTime(token_expiry_time.getTime() + expires_in * 1000);

  await User.findOneAndUpdate(
    { id },
    { token_expiry_time, refresh_token: cryptr.encrypt(refresh_token) },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return tokenResponse;
};

module.exports = getAccessToken;
