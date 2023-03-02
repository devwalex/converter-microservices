require("dotenv/config");

const jwtConfig = {
  appKey: process.env.APP_SECRET_KEY || "secret",
  options: {
    expiresIn: "1h",
  },
};

module.exports = jwtConfig;
