
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../../hooks/hooks";
import {
  getAdminBookingsThunk,
  updateBookingStatusThunk,
  type BookingStatus,
} from "../../../../redux/features/BookingsSlice";
import styles from "./ManageBookings.module.css";

const currency = (amount: number) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(amount);

const dateLabel = (value: string) =>
  new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString(
    "en-ZA",
    { day: "numeric", month: "short", year: "numeric" }
  );

const ManageBookings = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    adminBookings: bookings,
    isLoading,
    isUpdating,
    error,
    updateError } =
    useAppSelector((state) => state.booking);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(getAdminBookingsThunk());
  }, [dispatch]);

  const filteredBookings = useMemo(() => {
    const term = search.trim().toLowerCase();

    return bookings.filter((booking: any) => {
      const matchesStatus =
        filter === "all" || booking.status === filter;

      const matchesSearch =
        !term ||
        [
          booking.customer_name,
          booking.customer_email,
          booking.accommodation_name,
          booking.room_type,
          String(booking.id),
        ].some((value) => value?.toLowerCase().includes(term));

      return matchesStatus && matchesSearch;
    });
  }, [bookings, filter, search]);

  const changeStatus = async (
    id: number,
    status: BookingStatus
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to mark booking #${id} as ${status}?`
    );

    if (!confirmed) return;

    const result = await dispatch(
      updateBookingStatusThunk({ id, status })
    );

    if (updateBookingStatusThunk.fulfilled.match(result)) {
      // Keep the current data in sync with the server.
      dispatch(getAdminBookingsThunk());
    }
  };

  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <button
            className={styles.back}
            onClick={() => navigate("/admin-dashboard")}
          >
            ← Dashboard
          </button>
          <p className={styles.eyebrow}>GUEST OPERATIONS</p>
          <h1>Reservations</h1>
          <p>Review stays, guest details and booking status.</p>
        </div>

        <button
          className={styles.refresh}
          onClick={() => dispatch(getAdminBookingsThunk())}
          disabled={isLoading}
        >
          ↻ Refresh bookings
        </button>
      </header>

      <section className={styles.summary}>
        {(
          [
            ["All bookings", counts.all],
            ["Awaiting review", counts.pending],
            ["Confirmed", counts.confirmed],
            ["Completed", counts.completed],
          ] as const
        ).map(([label, count]) => (
          <article key={label} className={styles.summaryCard}>
            <span>{label}</span>
            <strong>{count}</strong>
          </article>
        ))}
      </section>

      <section className={styles.bookingPanel}>
        <div className={styles.controls}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guest, property, room or booking ID..."
            aria-label="Search bookings"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter bookings by status"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {updateError && (
          <p className={styles.error}>{updateError}</p>
        )}

        {isLoading ? (
          <div className={styles.empty}>Loading reservations...</div>
        ) : filteredBookings.length === 0 ? (
          <div className={styles.empty}>
            <span>▤</span>
            <h2>No reservations found</h2>
            <p>Try another search or status filter.</p>
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>Guest</th>
                  <th>Accommodation</th>
                  <th>Stay dates</th>
                  <th>Guests</th>
                  <th>Estimated total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredBookings.map((booking) => {
                  const nights = Math.max(
                    1,
                    Math.round(
                      (new Date(booking.check_out).getTime() -
                        new Date(booking.check_in).getTime()) /
                      86400000
                    )
                  );

                  const total =
                    Number(booking.price_per_night || 0) * nights;

                  return (
                    <tr key={booking.id}>
                      <td>
                        <strong>#{booking.id}</strong>
                        <small>
                          {dateLabel(booking.created_at)}
                        </small>
                      </td>

                      <td>
                        <strong>{booking.customer_name || "Guest"}</strong>
                        <small>{booking.customer_email}</small>
                      </td>

                      <td>
                        <strong>{booking.accommodation_name}</strong>
                        <small>{booking.room_type}</small>
                      </td>

                      <td>
                        <strong>{dateLabel(booking.check_in)}</strong>
                        <small>to {dateLabel(booking.check_out)}</small>
                      </td>

                      <td>{booking.guests}</td>

                      <td>{currency(total)}</td>

                      <td>
                        <span
                          className={`${styles.status} ${styles[booking.status]}`}
                        >
                          {booking.status}
                        </span>
                      </td>

                      <td>
                        <div className={styles.actions}>
                          {booking.status === "pending" && (
                            <button
                              className={styles.confirmButton}
                              disabled={isUpdating}
                              onClick={() =>
                                changeStatus(booking.id, "confirmed")
                              }
                            >
                              Confirm
                            </button>
                          )}

                          {["pending", "confirmed"].includes(
                            booking.status
                          ) && (
                              <button
                                className={styles.cancelButton}
                                disabled={isUpdating}
                                onClick={() =>
                                  changeStatus(booking.id, "cancelled")
                                }
                              >
                                Cancel
                              </button>
                            )}

                          {booking.status === "confirmed" && (
                            <button
                              className={styles.completeButton}
                              disabled={isUpdating}
                              onClick={() =>
                                changeStatus(booking.id, "completed")
                              }
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <footer className={styles.panelFooter}>
          Showing {filteredBookings.length} of {bookings.length} bookings
          {counts.cancelled > 0 &&
            ` · ${counts.cancelled} cancelled`}
        </footer>
      </section>
    </main>
  );
};

export default ManageBookings;