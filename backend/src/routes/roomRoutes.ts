
import { Router } from "express";
import {
  addRoomController,
  getAllRoomsController,
  getRoomsByAccommodationController,
  updateRoomController,
  deleteRoomController,
} from "../controllers/roomControllers";
import { protect, requireAdmin } from "../middleware/authMiddleware";

const router = Router();

// Read rooms belonging to a specific accommodation.
// Public read access allows the details page to display room options.
router.get(
  "/accommodations/:accommodationId/rooms",
  getRoomsByAccommodationController
);

// Read all rooms (useful for admin management).
router.get("/rooms", getAllRoomsController);
router.get("/accommodations/:accommodationId/rooms", getRoomsByAccommodationController);

// Create a room. The logged-in user must be an admin.
router.post("/rooms", protect, requireAdmin, addRoomController);

// Update and delete rooms. Admin access is required.
router.put("/rooms/:id", protect, requireAdmin, updateRoomController);
router.delete("/rooms/:id", protect, requireAdmin, deleteRoomController);

export default router;