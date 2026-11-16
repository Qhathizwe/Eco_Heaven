import { Router } from "express";
import { protect } from "../middleware/authMiddleware";

import {
  getMyNotificationsController,
  markNotificationReadController,
  markAllNotificationsReadController,
} from "../controllers/notificationControllers";

const router = Router();

router.get("/", protect, getMyNotificationsController);
router.patch("/read-all", protect, markAllNotificationsReadController);
router.patch("/:id/read", protect, markNotificationReadController);

export default router;