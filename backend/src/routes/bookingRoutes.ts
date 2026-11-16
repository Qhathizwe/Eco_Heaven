import { Router } from "express";

import {
  createBookingController,
  getMyBookingsController,
  getAllBookingsController,
  updateBookingStatusController,
  getBookingByIdController,
} from "../controllers/bookingControllers";

import {
  protect,
  requireAdmin,
} from "../middleware/authMiddleware";

const router = Router();

router.post("/bookings", protect, createBookingController);
router.get("/bookings/my", protect, getMyBookingsController);

router.get(
  "/bookings/admin",
  protect,
  requireAdmin,
  getAllBookingsController,
);

router.get("/bookings/:id", protect, getBookingByIdController);

router.patch(
  "/bookings/:id/status",
  protect,
  requireAdmin,
  updateBookingStatusController,
);

export default router;