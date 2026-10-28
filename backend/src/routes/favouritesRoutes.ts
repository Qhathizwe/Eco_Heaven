import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import {
  addMyFavourite,
  getMyFavourites,
  removeMyFavourite,
} from "../controllers/favouritesControllers";

const router = Router();

// Relative paths when mounted on /api
router.get("/users/me/favourites", protect, getMyFavourites);
router.post("/accommodations/:accommodationId/favourite", protect, addMyFavourite);
router.delete("/accommodations/:accommodationId/favourite", protect, removeMyFavourite);

export default router;