import { Router } from "express";
import {
  createUserController,
  loginUser,
  getAllUsers,
  getUserById,
  getUsersByRole,
  updateUserController,
  deleteUserController,
  getOwnProfile,
  updateOwnProfileController,
  changeOwnPasswordController,
  getUserFavouritesController,
} from "../controllers/userControllers";

import {
  protect,
  requireAdmin,
} from "../middleware/authMiddleware";

const router = Router();

// Auth routes (becomes /api/users/register and /api/users/login)
router.post("/register", createUserController);
router.post("/login", loginUser);

// Signed-in user's own profile & favourites routes (relative to /api/users)
router.get("/profile", protect, getOwnProfile);
router.get("/me/favourites", protect, getUserFavouritesController);
router.patch("/me", protect, updateOwnProfileController);
router.patch("/change-password", protect, changeOwnPasswordController);

// Administrator-only user management
router.get("/", protect, requireAdmin, getAllUsers);
router.get("/role/:role", protect, requireAdmin, getUsersByRole);
router.get("/:id", protect, requireAdmin, getUserById);
router.put("/:id", protect, requireAdmin, updateUserController);
router.delete("/:id", protect, requireAdmin, deleteUserController);

export default router;