const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

require("dotenv").config();

// Google OAuth is optional. The strategy is registered only when credentials are
// actually present, so a missing or misspelled env var can never crash the API
// while it boots (which Render would report as a failed deploy).
const googleConfigured =
  !!process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_ID !== "your_google_client_id";

if (googleConfigured) {
  if (!process.env.SERVER_URL) {
    console.warn(
      "[WARN] SERVER_URL is not set — the Google OAuth callback URL will be wrong. " +
        "Set it to this backend's public URL (e.g. https://your-app.onrender.com).",
    );
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.SERVER_URL}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });

          if (user) return done(null, user);

          const email = profile.emails?.[0]?.value;

          user = await User.findOne({ email });

          if (user) {
            user.googleId = profile.id;
            if (!user.avatar) {
              user.avatar = profile.photos?.[0]?.value || "";
            }
            await user.save();
            return done(null, user);
          }

          const newUser = await User.create({
            name: profile.displayName,
            email,
            passwordHash: "google-oauth",
            googleId: profile.id,
            avatar: profile.photos?.[0]?.value || "",
          });

          return done(null, newUser);
        } catch (err) {
          return done(err, null);
        }
      },
    ),
  );
} else {
  console.warn(
    "[WARN] Google OAuth disabled — GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are not set.",
  );
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select("-passwordHash");
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
