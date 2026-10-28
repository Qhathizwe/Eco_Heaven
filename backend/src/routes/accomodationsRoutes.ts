import { Router } from "express";
import {
  createAccomodationController,
  getAllAccomodationsController,
  getAccomodationByIdController,
  getAccomodationByNameController,
  getAccomodationByProvinceController,
  updateAccomodationController,
  deleteAccomodationController,
} from "../controllers/accomodationControllers";
import { upload } from "../middleware/uploadMiddleware";
import { protect, requireAdmin } from "../middleware/authMiddleware";

const router = Router();

// Public routes (maps to /api/accommodations...)
router.get("/", getAllAccomodationsController);
router.get("/search", getAccomodationByNameController);
router.get("/province/:province", getAccomodationByProvinceController);
router.get("/:id", getAccomodationByIdController);

// Admin routes (maps to /api/accommodations...)
router.post(
  "/",
  protect,
  requireAdmin,
  upload.array("pictures", 10),
  createAccomodationController
);

router.put(
  "/:id",
  protect,
  requireAdmin,
  upload.array("pictures", 10),
  updateAccomodationController
);

router.delete(
  "/:id",
  protect,
  requireAdmin,
  deleteAccomodationController
);

export default router;