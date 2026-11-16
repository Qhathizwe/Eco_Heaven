import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import Navbar from "../../components/navbar/Navbar";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";

import { verifyPaymentThunk } from "../../redux/features/paymentSlice";
import { getBookingByIdThunk } from "../../redux/features/BookingsSlice";

import styles from "./BookingSuccess.module.css";

function formatDate(value: string | Date | undefined) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getNights(checkIn: string | Date, checkOut: string | Date) {
  const start = new Date(`${String(checkIn).slice(0, 10)}T00:00:00`);
  const end = new Date(`${String(checkOut).slice(0, 10)}T00:00:00`);

  const difference = end.getTime() - start.getTime();

  return Math.max(0, Math.round(difference / (1000 * 60 * 60 * 24)));
}

function getAccommodationImage(value: unknown): string {
  const fallback =
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200";

  if (Array.isArray(value)) {
    return typeof value[0] === "string" && value[0]
      ? value[0]
      : fallback;
  }

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed: unknown = JSON.parse(value);

      if (
        Array.isArray(parsed) &&
        typeof parsed[0] === "string"
      ) {
        return parsed[0];
      }
    } catch {
      return value;
    }
  }

  return fallback;
}

export default function BookingSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const reference =
    searchParams.get("reference") || searchParams.get("trxref");

  const bookingId = Number(searchParams.get("booking"));

  const {
    isVerifying,
    verifiedBooking,
    error: paymentError,
  } = useAppSelector((state) => state.payment);

  const {
    currentBooking,
    isLoadingCurrent,
    currentError,
  } = useAppSelector((state) => state.booking);

  const isOnlinePayment = Boolean(reference);

  const booking = isOnlinePayment
    ? verifiedBooking
    : currentBooking;

  const isLoading = isOnlinePayment
    ? isVerifying
    : isLoadingCurrent;

  const error = isOnlinePayment
    ? paymentError
    : currentError;

  useEffect(() => {
    if (reference) {
      void dispatch(verifyPaymentThunk(reference));
      return;
    }

    if (Number.isInteger(bookingId) && bookingId > 0) {
      void dispatch(getBookingByIdThunk(bookingId));
    }
  }, [dispatch, reference, bookingId]);

  const nights = booking
    ? getNights(booking.check_in, booking.check_out)
    : 0;

  const nightlyRate = Number(booking?.price_per_night ?? 0);

  const totalAmount = Number(
    booking?.total_price ??
      (nightlyRate * nights),
  );

  const image = getAccommodationImage(
    booking?.accommodation_pictures,
  );

  if (isLoading) {
    return (
      <div className={styles.page}>
        <Navbar />

        <main className={styles.center}>
          <section className={styles.loadingCard}>
            <div className={styles.loader} />
            <p className={styles.eyebrow}>WILDHAVEN RESERVATIONS</p>
            <h1>
              {isOnlinePayment
                ? "Verifying your payment"
                : "Retrieving your reservation"}
            </h1>
            <p>
              Please wait while we securely retrieve your booking
              information. Do not close this page.
            </p>
          </section>
        </main>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className={styles.page}>
        <Navbar />

        <main className={styles.center}>
          <section className={styles.errorCard}>
            <div className={styles.errorIcon}>!</div>

            <p className={styles.eyebrow}>RESERVATION UPDATE</p>

            <h1>
              {isOnlinePayment
                ? "Payment not verified"
                : "Reservation not found"}
            </h1>

            <p>
              {error ||
                "We could not find the booking information for this request."}
            </p>

            <p className={styles.helpText}>
              If your account was charged, please do not pay again.
              Contact our support team with your Paystack reference.
            </p>

            <div className={styles.actions}>
              <Link to="/my-bookings" className={styles.primaryButton}>
                View my bookings
              </Link>

              <Link to="/" className={styles.secondaryButton}>
                Return home
              </Link>
            </div>
          </section>
        </main>
      </div>
    );
  }

  const isPaid = isOnlinePayment;
  const status = String(booking.status || "pending").toLowerCase();

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.successIcon}>
            {isPaid ? "✓" : "⌂"}
          </div>

          <p className={styles.eyebrow}>
            {isPaid ? "PAYMENT RECEIVED" : "RESERVATION RECORDED"}
          </p>

          <h1>
            {isPaid
              ? "Your stay is confirmed!"
              : "Your reservation is recorded!"}
          </h1>

          <p className={styles.subtitle}>
            {isPaid
              ? "Your payment has been verified and your room has been successfully booked."
              : "Your room reservation has been recorded. Payment is still outstanding and will be settled at the property."}
          </p>

          <div
            className={`${styles.statusPill} ${
              isPaid ? styles.paid : styles.pending
            }`}
          >
            <span />
            {isPaid
              ? "Paid · Booking confirmed"
              : "Payment outstanding · Reservation pending"}
          </div>
        </section>

        <section className={styles.receipt}>
          <div className={styles.receiptHeader}>
            <div>
              <p className={styles.eyebrow}>BOOKING CONFIRMATION</p>
              <h2>Your reservation details</h2>
            </div>

            <div className={styles.bookingNumber}>
              <span>BOOKING NUMBER</span>
              <strong>#{booking.id}</strong>
            </div>
          </div>

          <div className={styles.property}>
            <img
              src={image}
              alt={booking.accommodation_name || "Booked accommodation"}
            />

            <div className={styles.propertyInfo}>
              <span className={styles.propertyLabel}>YOUR ACCOMMODATION</span>

              <h3>
                {booking.accommodation_name || "WildHeaven accommodation"}
              </h3>

              <p>
                {booking.accommodation_address || "Address not available"}
              </p>

              <span className={styles.roomType}>
                {booking.room_type || "Selected room"}
              </span>
            </div>
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.detail}>
              <span>CHECK-IN</span>
              <strong>{formatDate(booking.check_in)}</strong>
            </div>

            <div className={styles.detail}>
              <span>CHECK-OUT</span>
              <strong>{formatDate(booking.check_out)}</strong>
            </div>

            <div className={styles.detail}>
              <span>DURATION</span>
              <strong>
                {nights} {nights === 1 ? "night" : "nights"}
              </strong>
            </div>

            <div className={styles.detail}>
              <span>GUESTS</span>
              <strong>
                {booking.guests}{" "}
                {booking.guests === 1 ? "guest" : "guests"}
              </strong>
            </div>

            <div className={styles.detail}>
              <span>ROOM</span>
              <strong>{booking.room_type || "Selected room"}</strong>
            </div>

            <div className={styles.detail}>
              <span>BOOKING STATUS</span>
              <strong className={styles.bookingStatus}>
                {status}
              </strong>
            </div>
          </div>

          <div className={styles.paymentSummary}>
            <h3>Payment summary</h3>

            <div className={styles.paymentRow}>
              <span>Room rate</span>
              <strong>
                R {nightlyRate.toLocaleString("en-ZA", {
                  minimumFractionDigits: 2,
                })}{" "}
                / night
              </strong>
            </div>

            <div className={styles.paymentRow}>
              <span>Number of nights</span>
              <strong>{nights}</strong>
            </div>

            <div className={styles.paymentRow}>
              <span>Payment method</span>
              <strong>
                {isPaid ? "Paystack" : "Pay at property"}
              </strong>
            </div>

            <div className={styles.paymentRow}>
              <span>Payment status</span>
              <strong className={isPaid ? styles.paidText : styles.pendingText}>
                {isPaid ? "Paid" : "Outstanding"}
              </strong>
            </div>

            <div className={styles.totalRow}>
              <span>{isPaid ? "AMOUNT PAID" : "AMOUNT DUE"}</span>
              <strong>
                R {totalAmount.toLocaleString("en-ZA", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>
            </div>
          </div>

          {booking.payment_reference && (
            <div className={styles.reference}>
              <span>PAYMENT REFERENCE</span>
              <strong>{booking.payment_reference}</strong>
            </div>
          )}

          <div className={styles.notice}>
            <strong>
              {isPaid
                ? "Keep this confirmation for your records."
                : "Please remember that payment is still outstanding."}
            </strong>

            <p>
              You can return to your account at any time to view
              your reservation and its latest status.
            </p>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => navigate("/my-bookings")}
            >
              View my bookings
            </button>

            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => navigate("/")}
            >
              Explore more stays
            </button>
          </div>
        </section>

        <p className={styles.footerNote}>
          Thank you for choosing WildHeaven. We look forward to welcoming you.
        </p>
      </main>
    </div>
  );
}