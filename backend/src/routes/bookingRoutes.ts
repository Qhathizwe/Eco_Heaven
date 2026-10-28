import { Router } from "express";
import {
  createBookingController,
  getMyBookingsController,
  getAllBookingsController,
  updateBookingStatusController,
} from "../controllers/bookingControllers";
import { protect, requireAdmin } from "../middleware/authMiddleware";

const router = Router();

//  Relative to /api/bookings
router.post("/", protect, createBookingController);
router.get("/my", protect, getMyBookingsController);

// Admin-only routes
router.get("/admin", protect, requireAdmin, getAllBookingsController);
router.patch("/:id/status", protect, requireAdmin, updateBookingStatusController);

export default router;