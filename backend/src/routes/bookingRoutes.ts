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
router.post("/bookings", protect, createBookingController);
router.get("/bookings/my", protect, getMyBookingsController);

// Admin-only routes
router.get("/bookings/admin", protect, requireAdmin, getAllBookingsController);
router.patch("/bookings/:id/status", protect, requireAdmin, updateBookingStatusController);

export default router;