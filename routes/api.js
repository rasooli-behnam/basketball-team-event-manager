const router = require("express").Router();
const ensureLoggedIn = require("connect-ensure-login").ensureLoggedIn;

router.get("/", (req, res) => {
  res.status(200).send("this is a public area...");
});

router.get("/private", ensureLoggedIn("/auth/login"), (req, res) => {
  res.status(200).send("this is a private area...");
});

module.exports = router;
