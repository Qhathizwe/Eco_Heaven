import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = Router();

function getFrontendUrl(): string {
  const configured = process.env.FRONTEND_URL;

  if (!configured) {
    throw new Error("FRONTEND_URL is not configured.");
  }

  return configured.split(",")[0].trim().replace(/\/+$/, "");
}

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

router.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate(
      "google",
      { session: false },
      (error: unknown, user: Express.User | false | null) => {
        if (error || !user) {
          const frontend = getFrontendUrl();
          res.redirect(
            `${frontend}/login?error=google_auth_failed`,
          );
          return;
        }

        req.user = user;
        next();
      },
    )(req, res, next);
  },
  (req, res) => {
    try {
      const user = req.user as {
        id: number;
        email: string;
        role: "admin" | "user";
      };

      if (
        !user ||
        !user.id ||
        !user.email ||
        !["admin", "user"].includes(user.role)
      ) {
        res.redirect(
          `${getFrontendUrl()}/login?error=invalid_google_account`,
        );
        return;
      }

      const secret = process.env.JWT_SECRET;

      if (!secret) {
        throw new Error("JWT_SECRET is not configured.");
      }

      const token = jwt.sign(
        {
          userId: Number(user.id),
          email: user.email,
          role: user.role,
        },
        secret,
        { expiresIn: "7d" },
      );

      const frontendUrl = process.env.FRONTEND_URL;

      return res.redirect(
        `${frontendUrl}/oauth-success?token=${encodeURIComponent(token)}`
      );
    } catch (error) {
      console.error("Google OAuth callback error:", error);

      res.redirect(
        `${getFrontendUrl()}/login?error=oauth_callback_error`,
      );
    }
  },
);

export default router;