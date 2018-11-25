global.__rootdir = __dirname;
require("dotenv").config();
const cookieSession = require("cookie-session");
const cors = require("cors");
const debug = require("debug")("app");
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const passport = require("passport");
require("./auth");

const app = new express();
app.use(morgan("tiny"));
app.use(express.json());
app.use(cors({ origin: "https://localhost:3000" }));
app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [process.env.COOKIE_SESSION_KEY]
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/api", require("./routes/api"));
app.use("/auth", require("./routes/auth"));

mongoose
  .connect("mongodb://localhost:27017/coffee-club-shout-tracker")
  .then(() => debug("Connected to MongoDB..."))
  .catch(err => debug("could not connect to MongoDB...", err));

const port = process.env.PORT || 8080;
app.listen(port, debug(`Listening on port ${port}...`));
