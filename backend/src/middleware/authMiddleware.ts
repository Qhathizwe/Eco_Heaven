import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { user_role } from "../types/app.types";

export interface AuthTokenPayload {
  userId: number;
  email: string;
  role: user_role;
}

declare global {
  namespace Express {
    interface Request {
      tokenData?: AuthTokenPayload;
    }
  }
}

export function protect(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith("Bearer ")
    ? authorization.substring(7)
    : null;

  if (!token) {
    res.status(401).json({ message: "Please log in to continue." });
    return;
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({
      message: "Authentication is not configured on the server.",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as AuthTokenPayload;

    if (
      !Number.isInteger(decoded.userId) ||
      !decoded.email ||
      !["admin", "user"].includes(decoded.role)
    ) {
      res.status(401).json({ message: "Invalid authentication token." });
      return;
    }

    req.tokenData = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch {
    res.status(401).json({
      message: "Your session has expired. Please log in again.",
    });
  }
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.tokenData) {
    res.status(401).json({ message: "Authentication required." });
    return;
  }

  if (req.tokenData.role !== "admin") {
    res.status(403).json({
      message: "You need administrator access to perform this action.",
    });
    return;
  }

  next();
}