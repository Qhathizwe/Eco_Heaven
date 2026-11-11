import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { query } from "./database";

export const initializePassportStrategies = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: String(process.env.GOOGLE_CLIENT_ID || ""),
        clientSecret: String(process.env.GOOGLE_CLIENT_SECRET || ""),
        callbackURL: String(process.env.GOOGLE_CALLBACK_URL || ""),
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName;

          if (!email) {
            return done(new Error("No email returned from Google"), undefined);
          }

          const userCheck = await query("SELECT * FROM users WHERE email = $1", [email]);

          let user;
          if (userCheck.rows.length > 0) {
            user = userCheck.rows[0];
          } else {
            const newUser = await query(
              "INSERT INTO users (name, email, role, is_verified) VALUES ($1, $2, 'user', true) RETURNING *",
              [name, email]
            );
            user = newUser.rows[0];
          }

          return done(null, user);
        } catch (error) {
          return done(error, undefined);
        }
      }
    )
  );
};

export default passport;
