import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../../components/navbar/Navbar";
import { useAppSelector } from "../../../hooks/hooks";
import type { Booking } from "../../../types/app.types";
import styles from "./MyBookings.module.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:7000/api"
).replace(/\/$/, "");

export default function MyBookings() {
  const { token, isAuthenticated } = useAppSelector((state) => state.login);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadBookings() {
      if (!isAuthenticated || !token) {
        setError("Please sign in to view your bookings.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/bookings/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load bookings.");
        }

        if (active) {
          setBookings(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Unable to load bookings.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadBookings();

    return () => {
      active = false;
    };
  }, [isAuthenticated, token]);

  return (
    <>
      <Navbar />

      <main className={styles.page}>
        <p className={styles.eyebrow}>YOUR WILDHAVEN ACCOUNT</p>
        <h1>My bookings</h1>
        <p className={styles.intro}>
          Your upcoming escapes and previous reservations, all in one place.
        </p>

        {loading && <p className={styles.message}>Loading your bookings…</p>}

        {!loading && error && (
          <section className={styles.notice} role="alert">
            <h2>We couldn't load your bookings</h2>
            <p>{error}</p>
            <Link to="/login">Sign in again</Link>
          </section>
        )}

        {!loading && !error && bookings.length === 0 && (
          <section className={styles.empty}>
            <span className={styles.emptyIcon} aria-hidden="true">⌂</span>
            <h2>Your next escape is waiting.</h2>
            <p>
              You haven't made a booking yet. Explore our stays to plan your
              next getaway.
            </p>
            <Link to="/#stays" className={styles.primaryButton}>
              Explore stays
            </Link>
          </section>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className={styles.list}>
            {bookings.map((booking) => {
              const image = booking.accommodation_pictures?.[0];
              const status = booking.status.toLowerCase();

              return (
                <article className={styles.card} key={booking.id}>
                  {image ? (
                    <img
                      className={styles.image}
                      src={image}
                      alt={booking.accommodation_name || "Accommodation"}
                    />
                  ) : (
                    <div className={styles.imagePlaceholder}>WildHaven</div>
                  )}

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
                      {booking.accommodation_address}
                    </p>

                    <div className={styles.details}>
                      <div>
                        <span>CHECK-IN</span>
                        <strong>{booking.check_in.slice(0, 10)}</strong>
                      </div>
                      <div>
                        <span>CHECK-OUT</span>
                        <strong>{booking.check_out.slice(0, 10)}</strong>
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
                    <p className={styles.disclaimer}>
                      This is the room's nightly price. A final booking total
                      is not currently stored by the backend.
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