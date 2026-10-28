import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import {
  createOrUpdateReview,
  getAccommodationReviews,
  removeMyReview,
} from "../controllers/reviewsControllers";

const router = Router();


// Reviews can be read publicly; create/update/delete require login.
router.get(
  "/accommodations/:accommodationId/reviews",
  getAccommodationReviews
);
router.post(
  "/accommodations/:accommodationId/reviews",
  protect,
  createOrUpdateReview
);
router.delete("/reviews/:reviewId", protect, removeMyReview);

export default router;