import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../../../hooks/hooks";
import { getMyBookingsThunk } from "../../../redux/features/BookingsSlice";
import type { Booking } from "../../../redux/features/BookingsSlice";

import Navbar from "../../../components/navbar/Navbar";
import styles from "./MyBookings.module.css";
import hero from "../../../assets/hero-image.jpg";

type BookingFilter = "all" | "upcoming" | "past" | "cancelled";

function formatDate(value: string | Date) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getImage(value: unknown) {
  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0];
  }

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed: unknown = JSON.parse(value);

      if (Array.isArray(parsed) && typeof parsed[0] === "string") {
        return parsed[0];
      }
    } catch {
      return value;
    }
  }

  return hero;
}

function getNightCount(checkIn: string | Date, checkOut: string | Date) {
  const start = new Date(`${String(checkIn).slice(0, 10)}T00:00:00`);
  const end = new Date(`${String(checkOut).slice(0, 10)}T00:00:00`);

  return Math.max(
    0,
    Math.round((end.getTime() - start.getTime()) / 86400000),
  );
}

function getBookingTotal(booking: Booking) {
  const nights = getNightCount(booking.check_in, booking.check_out);
  const nightlyRate = Number(booking.price_per_night || 0);

  return Number(
    booking.total_price ?? nightlyRate * nights,
  );
}

function getBookingCategory(booking: Booking): BookingFilter {
  const status = String(booking.status).toLowerCase();

  if (status === "cancelled") return "cancelled";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkout = new Date(
    `${String(booking.check_out).slice(0, 10)}T00:00:00`,
  );

  return checkout >= today ? "upcoming" : "past";
}

function getStatusClass(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === "confirmed") return styles.confirmed;
  if (normalized === "completed") return styles.completed;
  if (normalized === "cancelled") return styles.cancelled;

  return styles.pending;
}

export default function MyBookings() {
  const dispatch = useAppDispatch();

  const { userBookings, isLoading, error } = useAppSelector(
    (state) => state.booking,
  );

  const [filter, setFilter] = useState<BookingFilter>("all");

  useEffect(() => {
    void dispatch(getMyBookingsThunk());
  }, [dispatch]);

  const counts = useMemo(() => {
    return {
      all: userBookings.length,
      upcoming: userBookings.filter(
        (booking) => getBookingCategory(booking) === "upcoming",
      ).length,
      past: userBookings.filter(
        (booking) => getBookingCategory(booking) === "past",
      ).length,
      cancelled: userBookings.filter(
        (booking) => getBookingCategory(booking) === "cancelled",
      ).length,
    };
  }, [userBookings]);

  const filteredBookings = useMemo(() => {
    if (filter === "all") return userBookings;

    return userBookings.filter(
      (booking) => getBookingCategory(booking) === filter,
    );
  }, [filter, userBookings]);

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.container}>
        <header className={styles.heading}>
          <div>
            <span className={styles.eyebrow}>YOUR WILDHAVEN JOURNEY</span>
            <h1>My bookings</h1>
            <p>
              Keep track of your reservations, upcoming getaways and
              favourite moments.
            </p>
          </div>

          <Link to="/#stays" className={styles.exploreButton}>
            Explore stays <span>↗</span>
          </Link>
        </header>

        <section className={styles.stats}>
          <article className={styles.statCard}>
            <span>Total reservations</span>
            <strong>{counts.all}</strong>
            <small>All your bookings</small>
          </article>

          <article className={styles.statCard}>
            <span>Upcoming stays</span>
            <strong>{counts.upcoming}</strong>
            <small>Future reservations</small>
          </article>

          <article className={styles.statCard}>
            <span>Previous stays</span>
            <strong>{counts.past}</strong>
            <small>Your travel history</small>
          </article>
        </section>

        <section className={styles.bookingSection}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>YOUR RESERVATIONS</span>
              <h2>Every stay, in one place</h2>
            </div>

            <span className={styles.totalCount}>
              {filteredBookings.length}{" "}
              {filteredBookings.length === 1 ? "booking" : "bookings"}
            </span>
          </div>

          <div className={styles.filters} aria-label="Filter bookings">
            {(
              ["all", "upcoming", "past", "cancelled"] as BookingFilter[]
            ).map((item) => (
              <button
                type="button"
                key={item}
                className={filter === item ? styles.activeFilter : ""}
                onClick={() => setFilter(item)}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
                <span>{counts[item]}</span>
              </button>
            ))}
          </div>

          {isLoading && (
            <div className={styles.stateCard}>
              <div className={styles.loader} />
              <p>Loading your reservations...</p>
            </div>
          )}

          {!isLoading && error && (
            <div className={styles.errorCard} role="alert">
              <h3>We couldn't load your bookings</h3>
              <p>{error}</p>
              <button
                type="button"
                onClick={() => void dispatch(getMyBookingsThunk())}
              >
                Try again
              </button>
            </div>
          )}

          {!isLoading && !error && filteredBookings.length === 0 && (
            <div className={styles.emptyCard}>
              <div className={styles.emptyIcon}>⌂</div>
              <h3>
                {filter === "all"
                  ? "Your next escape is waiting."
                  : `No ${filter} bookings`}
              </h3>
              <p>
                {filter === "all"
                  ? "You haven't made a reservation yet. Explore our stays and find somewhere special."
                  : "There are no reservations in this category right now."}
              </p>
              <Link to="/#stays" className={styles.exploreButton}>
                Discover accommodation
              </Link>
            </div>
          )}

          {!isLoading && !error && filteredBookings.length > 0 && (
            <div className={styles.list}>
              {filteredBookings.map((booking) => {
                const nights = getNightCount(
                  booking.check_in,
                  booking.check_out,
                );

                const total = getBookingTotal(booking);
                const image = getImage(booking.accommodation_pictures);

                return (
                  <article className={styles.bookingCard} key={booking.id}>
                    <div className={styles.imageWrap}>
                      <img
                        src={image}
                        alt={booking.accommodation_name || "Accommodation"}
                        loading="lazy"
                      />
                      <span className={styles.imageLabel}>
                        {nights} {nights === 1 ? "NIGHT" : "NIGHTS"}
                      </span>
                    </div>

                    <div className={styles.cardContent}>
                      <div className={styles.cardTop}>
                        <div>
                          <span className={styles.reference}>
                            RESERVATION #{booking.id}
                          </span>
                          <h3>
                            {booking.accommodation_name || "Your stay"}
                          </h3>
                          <p className={styles.address}>
                            {booking.accommodation_address ||
                              "Location not available"}
                          </p>
                        </div>

                        <span
                          className={`${styles.status} ${getStatusClass(
                            booking.status,
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </div>

                      <div className={styles.details}>
                        <div>
                          <span>CHECK-IN</span>
                          <strong>{formatDate(booking.check_in)}</strong>
                        </div>

                        <div>
                          <span>CHECK-OUT</span>
                          <strong>{formatDate(booking.check_out)}</strong>
                        </div>

                        <div>
                          <span>ROOM</span>
                          <strong>{booking.room_type || "Selected room"}</strong>
                        </div>

                        <div>
                          <span>GUESTS</span>
                          <strong>
                            {booking.guests}{" "}
                            {booking.guests === 1 ? "guest" : "guests"}
                          </strong>
                        </div>
                      </div>

                      <div className={styles.cardFooter}>
                        <div className={styles.price}>
                          <span>Stay total</span>
                          <strong>
                            R{" "}
                            {total.toLocaleString("en-ZA", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </strong>
                          <small>
                            R {Number(booking.price_per_night || 0).toFixed(2)}{" "}
                            per night
                          </small>
                        </div>

                        <Link
                          to={`/payment-success?booking=${booking.id}`}
                          className={styles.detailsButton}
                        >
                          View reservation <span>→</span>
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}