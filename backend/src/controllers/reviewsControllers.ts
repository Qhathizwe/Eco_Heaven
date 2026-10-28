import { Request, Response } from "express";
import {
  getReviewSummary,
  getReviewsForAccommodation,
  deleteReview,
  upsertReview,
} from '../services/reviewServices'

function currentUserId(req: Request): number | null {
  const id = Number(req.tokenData?.userId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function positiveId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export const getAccommodationReviews = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const accommodationId = positiveId(req.params.accommodationId as string);

    if (!accommodationId) {
      res.status(400).json({ message: "Invalid accommodation ID." });
      return;
    }

    const [reviews, summary] = await Promise.all([
      getReviewsForAccommodation(accommodationId),
      getReviewSummary(accommodationId),
    ]);

    res.json({ success: true, data: reviews, summary });
  } catch (error) {
    console.error("Get reviews:", error);
    res.status(500).json({ message: "Could not load reviews." });
  }
};

export const createOrUpdateReview = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = currentUserId(req);
    const accommodationId = positiveId(req.params.accommodationId as string);
    const rating = Number(req.body.rating);
    const title = String(req.body.title ?? "").trim();
    const comment = String(req.body.comment ?? "").trim();

    if (!userId) {
      res.status(401).json({ message: "Please sign in to review a stay." });
      return;
    }

    if (!accommodationId) {
      res.status(400).json({ message: "Invalid accommodation ID." });
      return;
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      res.status(400).json({ message: "Rating must be between 1 and 5." });
      return;
    }

    if (!comment || comment.length < 5 || comment.length > 2000) {
      res.status(400).json({
        message: "Your review must be between 5 and 2,000 characters.",
      });
      return;
    }

    if (title.length > 120) {
      res.status(400).json({ message: "Review title is too long." });
      return;
    }

    const review = await upsertReview({
      userId,
      accommodationId,
      rating,
      title: title || undefined,
      comment,
    });

    res.status(201).json({
      success: true,
      data: review,
      message: "Your review has been saved.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not save review.";
    console.error("Save review:", error);

    res.status(message === "Accommodation not found." ? 404 : 500).json({
      message,
    });
  }
};

export const removeMyReview = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = currentUserId(req);
    const reviewId = positiveId(req.params.reviewId as string);

    if (!userId) {
      res.status(401).json({ message: "Please sign in." });
      return;
    }

    if (!reviewId) {
      res.status(400).json({ message: "Invalid review ID." });
      return;
    }

    const deleted = await deleteReview(
      reviewId,
      userId,
      req.tokenData?.role === "admin"
    );

    if (!deleted) {
      res.status(404).json({
        message: "Review not found or you do not have permission to delete it.",
      });
      return;
    }

    res.json({ success: true, message: "Review deleted." });
  } catch (error) {
    console.error("Delete review:", error);
    res.status(500).json({ message: "Could not delete review." });
  }
};