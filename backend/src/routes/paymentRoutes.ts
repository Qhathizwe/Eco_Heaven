// src/routes/paymentRoutes.ts
import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import {
  initializePaymentController,
  verifyPaymentController,
} from "../controllers/paymentControllers";

const router = Router();

router.post("/initialize", protect, initializePaymentController);
router.get("/verify/:reference", protect, verifyPaymentController);

export default router;