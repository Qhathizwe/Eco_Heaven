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

router.get("/rooms", getAllRoomsController);

router.get(
  "/accommodations/:accommodationId/rooms",
  getRoomsByAccommodationController,
);

router.post("/rooms", protect, requireAdmin, addRoomController);
router.put("/rooms/:id", protect, requireAdmin, updateRoomController);
router.delete("/rooms/:id", protect, requireAdmin, deleteRoomController);

export default router;