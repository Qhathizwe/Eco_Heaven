import { Router } from "express";
import {
  createUserController,
  loginUser,
  getAllUsers,
  getUserById,
  getUsersByRole,
  updateUserController,
  deleteUserController,
} from "../controllers/userControllers";
import { protect, requireAdmin } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", createUserController);
router.post("/login", loginUser);

router.get("/users", protect, requireAdmin, getAllUsers);
router.get("/users/role/:role", protect, requireAdmin, getUsersByRole);
router.get("/users/:id", protect, requireAdmin, getUserById);
router.put("/users/:id", protect, requireAdmin, updateUserController);
router.delete("/users/:id", protect, requireAdmin, deleteUserController);

export default router;