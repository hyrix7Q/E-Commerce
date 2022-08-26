var { expressjwt: jwt } = require("express-jwt");

function authJwt() {
  const secret = process.env.secret;
  return expressJwt({
    secret: secret,
    algorithms: ["HS256"],
  });
}

module.exports = authJwt;
