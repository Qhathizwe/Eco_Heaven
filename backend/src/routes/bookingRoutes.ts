import { Router } from "express";
import {
  createBookingController,
  getMyBookingsController,
} from "../controllers/bookingControllers";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.post("/bookings", protect, createBookingController);
router.get("/bookings/my", protect, getMyBookingsController);

export default router;