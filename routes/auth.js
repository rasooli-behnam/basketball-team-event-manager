const router = require("express").Router();
const passport = require("passport");

router.get("/login", passport.authenticate("google", { scope: ["profile"] }));

router.get(
  "/callback",
  passport.authenticate("google", {
    successReturnToOrRedirect: "/api",
    failureRedirect: "/auth/login"
  }),
  function(req, res) {}
);

router.get("/logout", (req, res) => {
  req.logOut();
  res.send("Logged out successfully!");
});

module.exports = router;
