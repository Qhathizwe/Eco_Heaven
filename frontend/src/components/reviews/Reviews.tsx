
import { type FormEvent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import {
  fetchReviews,
  saveReview,
} from "../../redux/features/reviewSlice";
import styles from "./Reviews.module.css";

interface Props {
  accommodationId: number;
}

const Review = ({ accommodationId }: Props) => {
  const dispatch = useAppDispatch();
  const { items, summary, isLoading, isSaving, error } =
    useAppSelector((state) => state.review);
  const { isAuthenticated } = useAppSelector((state) => state.login);

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    dispatch(fetchReviews(accommodationId));
  }, [dispatch, accommodationId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const result = await dispatch(
      saveReview({
        accommodationId,
        rating,
        title: title.trim(),
        comment: comment.trim(),
      })
    );

    if (saveReview.fulfilled.match(result)) {
      setMessage("Your review has been saved. Thank you!");
      setTitle("");
      setComment("");
      dispatch(fetchReviews(accommodationId));
    }
  }

  return (
    <section className={styles.section} id="reviews">
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>GUEST EXPERIENCES</span>
          <h2>Reviews from our guests</h2>
          <p>Real feedback helps travellers choose their next escape.</p>
        </div>

        <div className={styles.ratingSummary}>
          <strong>{Number(summary.average_rating).toFixed(1)}</strong>
          <span className={styles.stars} aria-label="Average rating">
            ★★★★★
          </span>
          <small>{summary.review_count} reviews</small>
        </div>
      </div>

      {isAuthenticated ? (
        <form className={styles.reviewForm} onSubmit={handleSubmit}>
          <h3>Share your experience</h3>

          <label className={styles.label}>
            Your rating
            <div className={styles.ratingPicker}>
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={
                    value <= rating
                      ? styles.starSelected
                      : styles.starUnselected
                  }
                  onClick={() => setRating(value)}
                  aria-label={`${value} star${value === 1 ? "" : "s"}`}
                  aria-pressed={rating === value}
                >
                  ★
                </button>
              ))}
            </div>
          </label>

          <label className={styles.label}>
            Review title (optional)
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={120}
              placeholder="What stood out about your stay?"
            />
          </label>

          <label className={styles.label}>
            Your review
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              required
              minLength={5}
              maxLength={2000}
              rows={4}
              placeholder="Tell other travellers about the rooms, service, location and experience..."
            />
            <small>{comment.length}/2000 characters</small>
          </label>

          {error && <p className={styles.error}>{error}</p>}
          {message && <p className={styles.success}>{message}</p>}

          <button
            className={styles.submitButton}
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? "Saving review…" : "Submit review"}
          </button>
        </form>
      ) : (
        <div className={styles.signInNotice}>
          <p>Stayed with us? Sign in to share your experience.</p>
          <a href="/login">Sign in to review →</a>
        </div>
      )}

      <div className={styles.reviewList}>
        {isLoading ? (
          <p className={styles.emptyState}>Loading guest reviews…</p>
        ) : items.length === 0 ? (
          <p className={styles.emptyState}>
            No reviews yet. Be the first to share your experience.
          </p>
        ) : (
          items.map((review) => (
            <article className={styles.reviewCard} key={review.id}>
              <div className={styles.avatar}>
                {(review.name?.[0] || "G").toUpperCase()}
              </div>

              <div className={styles.reviewBody}>
                <div className={styles.reviewTop}>
                  <div>
                    <h3>
                      {review.name} {review.surname}
                    </h3>
                    <small>
                      {new Date(review.created_at).toLocaleDateString(
                        "en-ZA",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </small>
                  </div>

                  <span className={styles.reviewStars}>
                    {"★".repeat(review.rating)}
                    <span>{"★".repeat(5 - review.rating)}</span>
                  </span>
                </div>

                {review.title && <h4>{review.title}</h4>}
                <p>{review.comment}</p>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
};

export default Review;