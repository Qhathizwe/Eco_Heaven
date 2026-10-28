
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../hooks/hooks";
import { getAccomodationsThunk } from "../../../redux/features/accomodationSlice";
import { getAdminBookingsThunk } from "../../../redux/features/BookingsSlice";
import { AddAccommodationModal } from "../../../components/modals/add accomodation modal/AddAccommodationModal";
import type { BookingStatus } from "../../../redux/features/BookingsSlice";
import styles from "./AdminDashBoard.module.css";

const formatDate = (date: string) =>
  new Date(`${date.slice(0, 10)}T00:00:00`).toLocaleDateString(
    "en-ZA",
    { day: "numeric", month: "short", year: "numeric" }
  );

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(value);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { accomodationList } = useAppSelector(
    (state) => state.accomodation
  );

  const {
    adminBookings: bookings,
    isLoading: bookingsLoading,
    error: bookingsError,
  } = useAppSelector((state) => state.booking);

  const user = useAppSelector((state) => state.login.user);

  useEffect(() => {
    dispatch(getAccomodationsThunk());
    dispatch(getAdminBookingsThunk());
  }, [dispatch]);

  const stats = useMemo(() => {
    const count = (status: BookingStatus) =>
      bookings.filter((booking) => booking.status === status).length;

    const confirmedRevenue = bookings
      .filter((booking) => booking.status === "confirmed")
      .reduce(
        (total, booking) =>
          total +
          Number(booking.price_per_night || 0) *
          Math.max(
            1,
            (new Date(booking.check_out).getTime() -
              new Date(booking.check_in).getTime()) /
            86400000
          ),
        0
      );

    return {
      total: bookings.length,
      pending: count("pending"),
      confirmed: count("confirmed"),
      cancelled: count("cancelled"),
      completed: count("completed"),
      confirmedRevenue,
    };
  }, [bookings]);

  const managementItems = [
    {
      icon: "⌂",
      title: "Accommodations",
      description: "Create listings and update property details.",
      route: "/admin/accommodations",
    },
    {
      icon: "▦",
      title: "Rooms & availability",
      description: "Manage room types, rates and capacity.",
      route: "/admin/rooms",
    },
    {
      icon: "▤",
      title: "Reservations",
      description: "Review and manage guest bookings.",
      route: "/admin/bookings",
    },
    {
      icon: "♙",
      title: "Customers",
      description: "View registered customer accounts.",
      route: "/admin/users",
    },
  ];

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.sidebar}>
        <button
          className={styles.brand}
          onClick={() => navigate("/")}
        >
          <span className={styles.brandMark}>W</span>
          <span>WildHeaven<small>ADMIN STUDIO</small></span>
        </button>

        <p className={styles.navLabel}>WORKSPACE</p>

        <nav className={styles.nav}>
          <button
            className={styles.activeNav}
            onClick={() => navigate("/admin-dashboard")}
          >
            <span>⌂</span> Overview
          </button>
          <button onClick={() => navigate("/admin/accommodations")}>
            <span>⌑</span> Accommodations
          </button>
          <button onClick={() => navigate("/admin/rooms")}>
            <span>▦</span> Rooms
          </button>
          <button onClick={() => navigate("/admin/bookings")}>
            <span>▤</span> Bookings
            {stats.pending > 0 && (
              <span className={styles.navCount}>{stats.pending}</span>
            )}
          </button>
          <button onClick={() => navigate("/admin/users")}>
            <span>♙</span> Customers
          </button>
        </nav>

        <div className={styles.sidebarBottom}>
          <div className={styles.sidebarNote}>
            <span>✦</span>
            <strong>Thoughtful stays.</strong>
            <p>Every detail makes the guest experience.</p>
          </div>

          <button
            className={styles.websiteButton}
            onClick={() => navigate("/")}
          >
            ↗ View public website
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div>
            <p className={styles.eyebrow}>MONDAY TO SUNDAY · OPERATIONS</p>
            <h1>Good day{user?.name ? `, ${user.name}` : ""}.</h1>
            <p className={styles.pageIntro}>
              Here is what's happening across your stays.
            </p>
          </div>

          <div className={styles.topbarActions}>
            <button
              className={styles.refreshButton}
              onClick={() => {
                dispatch(getAdminBookingsThunk());
                dispatch(getAccomodationsThunk());
              }}
              disabled={bookingsLoading}
            >
              ↻ Refresh
            </button>
            <button
              className={styles.primaryButton}
              onClick={() => setIsModalOpen(true)}
            >
              + Add a stay
            </button>
          </div>
        </header>

        <section className={styles.welcomeBanner}>
          <div className={styles.bannerText}>
            <span className={styles.bannerEyebrow}>
              YOUR HOSPITALITY OVERVIEW
            </span>
            <h2>Make room for memorable escapes.</h2>
            <p>
              Track reservations, keep your properties up to date
              and give every guest a wonderful experience.
            </p>
            <button onClick={() => navigate("/admin/bookings")}>
              Review reservations →
            </button>
          </div>
          <div className={styles.bannerDecoration} aria-hidden="true">
            ✳
          </div>
        </section>

        <section className={styles.statsGrid}>
          <article className={styles.statCard}>
            <div className={styles.statTop}>
              <span>Total bookings</span>
              <span className={styles.statIcon}>▤</span>
            </div>
            <strong>{bookingsLoading ? "…" : stats.total}</strong>
            <p>All recorded reservations</p>
          </article>

          <article className={styles.statCard}>
            <div className={styles.statTop}>
              <span>Awaiting confirmation</span>
              <span className={styles.statIcon}>◷</span>
            </div>
            <strong>{bookingsLoading ? "…" : stats.pending}</strong>
            <p>Bookings requiring attention</p>
          </article>

          <article className={styles.statCard}>
            <div className={styles.statTop}>
              <span>Confirmed stays</span>
              <span className={styles.statIcon}>✓</span>
            </div>
            <strong>{bookingsLoading ? "…" : stats.confirmed}</strong>
            <p>Confirmed reservations</p>
          </article>

          <article className={styles.statCard}>
            <div className={styles.statTop}>
              <span>Accommodations</span>
              <span className={styles.statIcon}>⌂</span>
            </div>
            <strong>{accomodationList.length}</strong>
            <p>Properties in your collection</p>
          </article>
        </section>

        <section className={styles.contentGrid}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <span className={styles.eyebrow}>GUEST ACTIVITY</span>
                <h2>Recent reservations</h2>
              </div>
              <button
                className={styles.textButton}
                onClick={() => navigate("/admin/bookings")}
              >
                View all →
              </button>
            </div>

            {bookingsError ? (
              <div className={styles.messageBox}>
                <p>{bookingsError}</p>
                <button
                  className={styles.textButton}
                  onClick={() => dispatch(getAdminBookingsThunk())}
                >
                  Try again
                </button>
              </div>
            ) : bookingsLoading ? (
              <div className={styles.messageBox}>
                Loading reservations…
              </div>
            ) : bookings.length === 0 ? (
              <div className={styles.messageBox}>
                <span className={styles.emptyIcon}>▤</span>
                <strong>No bookings yet</strong>
                <p>Guest reservations will appear here.</p>
              </div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.bookingTable}>
                  <thead>
                    <tr>
                      <th>Guest / property</th>
                      <th>Check-in</th>
                      <th>Guests</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 6).map((booking) => (
                      <tr key={booking.id}>
                        <td>
                          <strong>
                            {booking.customer_name || "Guest"}
                          </strong>
                          <span>{booking.accommodation_name}</span>
                        </td>
                        <td>{formatDate(booking.check_in)}</td>
                        <td>{booking.guests}</td>
                        <td>
                          <span
                            className={`${styles.status} ${styles[booking.status]
                              }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <span className={styles.eyebrow}>BOOKING BREAKDOWN</span>
                <h2>Reservation status</h2>
              </div>
            </div>

            {(
              [
                ["Pending", stats.pending, "pending"],
                ["Confirmed", stats.confirmed, "confirmed"],
                ["Completed", stats.completed, "completed"],
                ["Cancelled", stats.cancelled, "cancelled"],
              ] as const
            ).map(([label, count, key]) => (
              <div className={styles.statusRow} key={key}>
                <div className={styles.statusLabel}>
                  <span className={`${styles.statusDot} ${styles[key]}`} />
                  <span>{label}</span>
                </div>
                <strong>{count}</strong>
                <div className={styles.progressTrack}>
                  <span
                    className={`${styles.progressFill} ${styles[key]}`}
                    style={{
                      width: `${stats.total ? (count / stats.total) * 100 : 0
                        }%`,
                    }}
                  />
                </div>
              </div>
            ))}

            <div className={styles.revenueNote}>
              <span>Confirmed room-night value*</span>
              <strong>{formatCurrency(stats.confirmedRevenue)}</strong>
              <p>
                *Estimated from room nightly rates and confirmed dates;
                not a record of payments received.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.managementSection}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.eyebrow}>QUICK ACCESS</span>
              <h2>Manage your business</h2>
            </div>
          </div>

          <div className={styles.managementGrid}>
            {managementItems.map((item) => (
              <button
                className={styles.managementCard}
                key={item.title}
                onClick={() => navigate(item.route)}
              >
                <span className={styles.managementIcon}>{item.icon}</span>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
                <span className={styles.managementArrow}>Explore →</span>
              </button>
            ))}
          </div>
        </section>
      </main>

      <AddAccommodationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default AdminDashboard;