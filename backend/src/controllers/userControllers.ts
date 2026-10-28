import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as userServices from "../services/userServices";
import type { User, user_role } from "../types/app.types";

export async function createUserController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { name, surname, email, password, phone } = req.body;

    if (![name, surname, email, password, phone].every(
      (value) => typeof value === "string" && value.trim().length > 0,
    )) {
      res.status(400).json({
        message: "Name, surname, email, password and phone are required.",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      res.status(400).json({ message: "Enter a valid email address." });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({
        message: "Password must contain at least 8 characters.",
      });
      return;
    }

    const existingUser = await userServices.findUserByEmail(email);

    if (existingUser) {
      res.status(409).json({ message: "That email is already registered." });
      return;
    }

    const user = await userServices.createUser({
      name,
      surname,
      email,
      password,
      phone,
      role: "user",
    });

    res.status(201).json({
      message: "Your account has been created successfully.",
      user,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Unable to register your account." });
  }
}

export async function loginUser(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      res.status(400).json({ message: "Email and password are required." });
      return;
    }

    const user = await userServices.findUserByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("JWT_SECRET is missing.");
      res.status(500).json({ message: "Authentication is not configured." });
      return;
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      secret,
      { expiresIn: "1h" },
    );

    const { password: _passwordHash, ...safeUser } = user;

    res.status(200).json({
      message: "Login successful.",
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Unable to log in." });
  }
}

export async function getAllUsers(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    res.status(200).json(await userServices.findAllUsers());
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Unable to retrieve users." });
  }
}

export async function getUserById(
  req: Request,
  res: Response,
): Promise<void> {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ message: "Invalid user ID." });
    return;
  }

  try {
    const user = await userServices.findUserById(id);

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    const { password: _passwordHash, ...safeUser } = user;
    res.status(200).json(safeUser);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Unable to retrieve user." });
  }
}

export async function getUsersByRole(
  req: Request,
  res: Response,
): Promise<void> {
  const role = req.params.role as user_role;

  if (role !== "admin" && role !== "user") {
    res.status(400).json({ message: "Role must be admin or user." });
    return;
  }

  try {
    res.status(200).json(await userServices.findUserByRole(role));
  } catch (error) {
    console.error("Get users by role error:", error);
    res.status(500).json({ message: "Unable to retrieve users." });
  }
}

export async function updateUserController(
  req: Request,
  res: Response,
): Promise<void> {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ message: "Invalid user ID." });
    return;
  }

  try {
    const { name, surname, email, password, phone, role } = req.body;

    if (password !== undefined && (
      typeof password !== "string" || password.length < 8
    )) {
      res.status(400).json({
        message: "A new password must contain at least 8 characters.",
      });
      return;
    }

    if (role !== undefined && role !== "admin" && role !== "user") {
      res.status(400).json({ message: "Invalid user role." });
      return;
    }

    const updated = await userServices.updateUser(id, {
      name, surname, email, password, phone, role,
    });

    if (!updated) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    res.status(200).json({
      message: "User updated successfully.",
      user: updated,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Unable to update user." });
  }
}

export async function deleteUserController(
  req: Request,
  res: Response,
): Promise<void> {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ message: "Invalid user ID." });
    return;
  }

  try {
    const deleted = await userServices.deleteUser(id);

    if (!deleted) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    res.status(200).json({
      message: "User deleted successfully.",
      user: deleted,
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Unable to delete user." });
  }
}

export async function getOwnProfile(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const userId = req.tokenData?.userId;

    if (!userId) {
      res.status(401).json({ message: "Authentication required." });
      return;
    }

    const user = await userServices.findUserById(userId);

    if (!user) {
      res.status(404).json({ message: "User profile not found." });
      return;
    }

    const {
      password: _passwordHash,
      ...safeUser
    } = user;

    res.status(200).json({ user: safeUser });
  } catch (error) {
    console.error("Get own profile error:", error);
    res.status(500).json({ message: "Unable to retrieve your profile." });
  }
}

export async function updateOwnProfileController(
  req: Request,
  res: Response,
): Promise<void> {
  const userId = req.tokenData?.userId;

  if (!userId) {
    res.status(401).json({ message: "Authentication required." });
    return;
  }

  const { name, surname, email, phone } = req.body;

  if (
    typeof name !== "string" ||
    typeof surname !== "string" ||
    typeof email !== "string" ||
    typeof phone !== "string" ||
    !name.trim() ||
    !surname.trim() ||
    !email.trim() ||
    !phone.trim()
  ) {
    res.status(400).json({
      message: "Name, surname, email and phone are required.",
    });
    return;
  }

  try {
    const updated = await userServices.updateOwnProfile(userId, {
      name,
      surname,
      email,
      phone,
    });

    if (!updated) {
      res.status(404).json({ message: "User profile not found." });
      return;
    }

    res.status(200).json({
      message: "Profile updated successfully.",
      user: updated,
    });
  } catch (error: unknown) {
    const dbError = error as { code?: string };

    if (dbError.code === "23505") {
      res.status(409).json({
        message: "That email address is already registered.",
      });
      return;
    }

    console.error("Update own profile error:", error);
    res.status(500).json({ message: "Unable to update your profile." });
  }
}

export async function changeOwnPasswordController(
  req: Request,
  res: Response,
): Promise<void> {
  const userId = req.tokenData?.userId;

  if (!userId) {
    res.status(401).json({ message: "Authentication required." });
    return;
  }

  const { currentPassword, newPassword } = req.body;

  if (
    typeof currentPassword !== "string" ||
    typeof newPassword !== "string" ||
    !currentPassword ||
    !newPassword
  ) {
    res.status(400).json({
      message: "Current password and new password are required.",
    });
    return;
  }

  try {
    const changed = await userServices.changeOwnPassword(
      userId,
      currentPassword,
      newPassword,
    );

    if (!changed) {
      res.status(404).json({ message: "User account not found." });
      return;
    }

    res.status(200).json({
      message: "Password changed successfully.",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "CURRENT_PASSWORD_INCORRECT"
    ) {
      res.status(400).json({
        message: "Your current password is incorrect.",
      });
      return;
    }

    console.error("Change password error:", error);
    res.status(500).json({ message: "Unable to change your password." });
  }
}

// 👇 NEW: Added to support /api/users/me/favourites
export async function getUserFavouritesController(
  req: Request,
  res: Response,
): Promise<void> {
  const userId = req.tokenData?.userId;

  if (!userId) {
    res.status(401).json({ message: "Authentication required." });
    return;
  }

  try {
    const favourites = await userServices.getUserFavourites(userId);
    res.status(200).json({ favourites });
  } catch (error) {
    console.error("Get user favourites error:", error);
    res.status(500).json({ message: "Unable to retrieve your favourites." });
  }
}