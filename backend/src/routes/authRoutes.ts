import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = Router();

// 1. Point frontend explicitly here: /api/auth/google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

// 2. Matches Google's exact redirect contract: /api/auth/google/callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  (req: any, res) => {
    const user = req.user; 

    if (!user) {
      res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=auth_failed`);
      return;
    }

    // Generate token matching your application's current JWT strategy
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    res.redirect(
      `${process.env.FRONTEND_URL || "http://localhost:5173"}/oauth-success?token=${token}`
    );
  }
);

export default router;
