const GoogleStrategy = require("passport-google-oauth20");
const Member = require(__rootdir + "/db_models/Member");
const passport = require("passport");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_OAUTH_CLIENT_KEY,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      callbackURL: "http://localhost:8080/auth/callback"
    },
    function(accessToken, refreshToken, profile, done) {
      console.log(profile.id);
      Member.findOne({ googleId: profile.id }).then(currentUser => {
        if (currentUser) done(null, currentUser);
        else {
          new Member({
            googleId: profile.id,
            name: profile.displayName,
            allowed_operation: []
          })
            .save()
            .then(newUser => {
              done(null, newUser);
            });
        }
      });
    }
  )
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(userId, done) {
  Member.findById(userId).then(user => {
    done(null, user);
  });
});
