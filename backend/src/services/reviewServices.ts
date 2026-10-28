import { query } from "../config/database";
import { Review } from "../types/app.types";

export const createReviewTable = async (): Promise<void> => {
    await query(`
    CREATE TABLE IF NOT EXISTS accommodation_reviews (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,
      accommodation_id INTEGER NOT NULL
        REFERENCES accomodations(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      title VARCHAR(120),
      comment TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, accommodation_id)
    )
  `);
    console.log("Review table checked/created.");
};

export const getReviewsForAccommodation = async (
  accommodationId: number
) => {
  const result = await query(
    `SELECT
       r.id,
       r.accommodation_id,
       r.rating,
       r.title,
       r.comment,
       r.created_at,
       r.updated_at,
       r.user_id,
       u.name,
       u.surname
     FROM accommodation_reviews r
     JOIN users u ON u.id = r.user_id
     WHERE r.accommodation_id = $1
     ORDER BY r.created_at DESC`,
    [accommodationId]
  );

  return result.rows;
};

export const getReviewSummary = async (accommodationId: number) => {
  const result = await query(
    `SELECT
       COALESCE(ROUND(AVG(rating)::numeric, 1), 0) AS average_rating,
       COUNT(*)::integer AS review_count
     FROM accommodation_reviews
     WHERE accommodation_id = $1`,
    [accommodationId]
  );

  return result.rows[0];
};

export const upsertReview = async (review: Review) => {
  const { userId, accommodationId, rating, title, comment } = review;

  const accommodation = await query(
    "SELECT id FROM accomodations WHERE id = $1",
    [accommodationId]
  );

  if (accommodation.rows.length === 0) {
    throw new Error("Accommodation not found.");
  }

  const result = await query(
    `INSERT INTO accommodation_reviews
      (user_id, accommodation_id, rating, title, comment)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id, accommodation_id)
     DO UPDATE SET
       rating = EXCLUDED.rating,
       title = EXCLUDED.title,
       comment = EXCLUDED.comment,
       updated_at = NOW()
     RETURNING *`,
    [userId, accommodationId, rating, title ?? null, comment]
  );

  return result.rows[0];
};

export const deleteReview = async (
  reviewId: number,
  userId: number,
  isAdmin: boolean
) => {
  const result = await query(
    `DELETE FROM accommodation_reviews
     WHERE id = $1 AND (user_id = $2 OR $3 = TRUE)
     RETURNING id`,
    [reviewId, userId, isAdmin]
  );

  return result.rowCount !== 0;
};