const User = require("../api/models/user-model.js");
const oauth = require("../services/oauth.js");
const getAccessToken = require("../services/get-access-token.js");

/**
 * Whether or not an access token is valid
 *
 * @param {string} accessToken - User's access token
 */
const isUserAccessTokenValid = async (accessToken) => {
  try {
    await oauth.getUser(accessToken);
    return true;
  } catch (err) {
    return false;
  }
};

/**
 * Check whether user's stored token expiry time has already passed
 *
 * @param {string} userId - User's ID
 */
const isUserAccessTokenExpired = async (userId) => {
  const now = new Date();
  const user = await User.findOne({ id: userId });
  if (user && user.token_expiry_time && user.token_expiry_time <= now) {
    return true;
  } else {
    false;
  }
};

/**
 * Verify that request is coming from the correct user, or from official Sticker Surge bot
 *
 * options {Object}
 * - ajax {Boolean} - If true, request is ajax
 */
module.exports = (options = { ajax: false }) => {
  return async (req, res, next) => {
    // Verify bot acting on user's behalf
    let bot_auth = `Basic ${Buffer.from(
      process.env.DISCORD_BOT_TOKEN_HASH
    ).toString("base64")}`;

    if (req.headers.authorization && req.headers.authorization === bot_auth) {
      res.locals.userId = req.headers["author-id"]; // also add res.locals for user guilds
      return next();
    }

    // If there's no token or user ID, request user to log in
    if (!req.session.token || !req.session.id) {
      return options.ajax
        ? res.status(401).send("Unauthorized")
        : res.redirect("/login");
    }

    // If the access token is valid, continue on
    const isTokenValid = await isUserAccessTokenValid(req.session.token);
    if (isTokenValid) {
      res.locals.userId = req.session.id;
      return next();
    }

    // if the token is expired, get another one using the user's refresh token
    // (if possible)
    const isTokenExpired = await isUserAccessTokenExpired(req.session.id);
    if (!isTokenValid || isTokenExpired) {
      const tokenResponse = await getAccessToken({ userId: req.session.id });
      if (tokenResponse) {
        res.locals.userId = req.session.id;
        req.session.token = tokenResponse.access_token;
        return next();
      } else {
        // If there's no token response, prompt login 
        return options.ajax
          ? res.status(401).send("Unauthorized")
          : res.redirect("/login");
      }
    } else {
      // if the token is expired, but we can't get another using the refresh token
      // prompt login
      return options.ajax
        ? res.status(401).send("Unauthorized")
        : res.redirect("/login");
    }
  };
};
