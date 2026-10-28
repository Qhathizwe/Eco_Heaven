import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../store"; 
import { getMyBookingsThunk } from "../../../redux/features/BookingsSlice";
import Navbar from "../../../components/navbar/Navbar";
import styles from "./MyBookings.module.css";
import hero from "../../../assets/hero-image.jpg"; // Fallback image

export default function MyBookings() {
  const dispatch = useDispatch<AppDispatch>();
  
  // 🟢 Destructure userBookings from state.booking
  const { userBookings, isLoading, error } = useSelector(
    (state: RootState) => state.booking
  );

  useEffect(() => {
    // 🟢 Call user thunk instead of admin thunk
    void dispatch(getMyBookingsThunk());
  }, [dispatch]);

  return (
    <>
      <Navbar />

      <main className={styles.page}>
        <p className={styles.eyebrow}>YOUR WILDHAVEN ACCOUNT</p>
        <h1>My bookings</h1>
        <p className={styles.intro}>
          Your upcoming escapes and previous reservations, all in one place.
        </p>

        {isLoading && <p className={styles.message}>Loading your bookings…</p>}

        {!isLoading && error && (
          <section className={styles.notice} role="alert">
            <h2>We couldn't load your bookings</h2>
            <p>{error}</p>
            <Link to="/login">Sign in again</Link>
          </section>
        )}

        {!isLoading && !error && userBookings.length === 0 && (
          <section className={styles.empty}>
            <span className={styles.emptyIcon} aria-hidden="true">⌂</span>
            <h2>Your next escape is waiting.</h2>
            <p>You haven't made a booking yet. Explore our stays to plan your next getaway.</p>
            <Link to="/#stays" className={styles.primaryButton}>
              Explore stays
            </Link>
          </section>
        )}

        {!isLoading && !error && userBookings.length > 0 && (
          <div className={styles.list}>
            {userBookings.map((booking: any) => {
              // Extract picture safely (supports strings, arrays, or JSON strings)
              let bookingImage = hero;
              const rawPic = booking.accommodation_pictures || booking.pictures;
              if (Array.isArray(rawPic) && rawPic.length > 0) {
                bookingImage = rawPic[0];
              } else if (typeof rawPic === "string" && rawPic.trim()) {
                try {
                  const parsed = JSON.parse(rawPic);
                  if (Array.isArray(parsed) && parsed[0]) bookingImage = parsed[0];
                  else bookingImage = rawPic;
                } catch {
                  bookingImage = rawPic;
                }
              }

              const status = booking.status ? booking.status.toLowerCase() : "pending";

              return (
                <article className={styles.card} key={booking.id}>
                  <img
                    className={styles.image}
                    src={bookingImage}
                    alt={booking.accommodation_name || "Accommodation"}
                  />

                  <div className={styles.cardBody}>
                    <div className={styles.cardTop}>
                      <div>
                        <span className={styles.reference}>
                          BOOKING #{booking.id}
                        </span>
                        <h2>{booking.accommodation_name || "Your stay"}</h2>
                      </div>
                      <span className={`${styles.status} ${styles[status] || ""}`}>
                        {booking.status}
                      </span>
                    </div>

                    <p className={styles.address}>
                      {booking.accommodation_address || "Location unavailable"}
                    </p>

                    <div className={styles.details}>
                      <div>
                        <span>CHECK-IN</span>
                        <strong>{new Date(booking.check_in).toISOString().slice(0, 10)}</strong>
                      </div>
                      <div>
                        <span>CHECK-OUT</span>
                        <strong>{new Date(booking.check_out).toISOString().slice(0, 10)}</strong>
                      </div>
                      <div>
                        <span>ROOM</span>
                        <strong>{booking.room_type || "Selected room"}</strong>
                      </div>
                      <div>
                        <span>GUESTS</span>
                        <strong>{booking.guests}</strong>
                      </div>
                    </div>

                    <p className={styles.price}>
                      R {Number(booking.price_per_night || 0).toFixed(2)}
                      <span> / night</span>
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}