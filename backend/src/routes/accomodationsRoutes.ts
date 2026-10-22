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

// Public accommodation browsing
router.get("/accommodations", getAllAccomodationsController);
router.get("/accommodations/search", getAccomodationByNameController);
router.get(
  "/accommodations/province/:province",
  getAccomodationByProvinceController,
);
router.get("/accommodations/:id", getAccomodationByIdController);

// Admin-only accommodation management
router.post(
  "/accommodations",
  protect,
  requireAdmin,
  upload.array("pictures", 10),
  createAccomodationController,
);

router.put(
  "/accommodations/:id",
  protect,
  requireAdmin,
  upload.array("pictures", 10),
  updateAccomodationController,
);

router.delete(
  "/accommodations/:id",
  protect,
  requireAdmin,
  deleteAccomodationController,
);

export default router;