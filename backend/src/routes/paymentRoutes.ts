import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import {
  initializePaymentController,
  verifyPaymentController,
} from "../controllers/paymentControllers";

const router = Router();

router.post("/payments/initialize", protect, initializePaymentController);
router.get("/payments/verify/:reference", protect, verifyPaymentController);

export default router;