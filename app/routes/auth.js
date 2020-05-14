const oauth = require("../services/oauth.js");
const crypto = require("crypto");
const getAccessToken = require("../services/get-access-token.js");
const updateUserInfo = require("../services/update-user.js");

//Login route
const login = (req, res) => {
  const authorizationUri = oauth.generateAuthUrl({
    scope: ["identify", "guilds"],
    state: crypto.randomBytes(16).toString("hex"),
  });

  return res.redirect(authorizationUri);
};

//Logout route (heh it rhymes)
const logout = (req, res) => {
  req.session.reset();
  res.clearCookie("id");
  res.clearCookie("guilds");
  return res.redirect(req.header("Referer"));
};

const callback = async (req, res) => {
  // Get access token info from Discord
  const tokenResponse = await getAccessToken({
    authorizationCode: req.query.code,
  });

  const discordUser = await updateUserInfo(tokenResponse.access_token);

  // Cookies are set twice, once as tamper-proof httpOnly cookies for authentication,
  req.session.token = tokenResponse.access_token;
  req.session.id = discordUser.id;

  //And again as standard cookies for the view to use
  res.cookie("id", discordUser.id, {
    expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  });

  return res.redirect("/servers");
};

module.exports = { login, logout, callback };
