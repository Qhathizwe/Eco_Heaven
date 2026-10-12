
import { useNavigate } from "react-router-dom";
import styles from "./UserDashboard.module.css";

const UserDashboard = () => {
  const navigate = useNavigate();

  
  const upcomingBookings = [
    {
      id: "WH-1001",
      stay: "Luxury Forest Lodge",
      dates: "Dates to be confirmed",
      status: "Pending",
    },
  ];

  return (
    <div className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>WildHaven</div>
        <p className={styles.sidebarLabel}>YOUR SPACE</p>

        <nav className={styles.navigation}>
          <a href="#overview" className={styles.activeLink}>
            <span>⌂</span> Overview
          </a>
          <a href="#bookings">
            <span>▣</span> My bookings
          </a>
          <a href="#favourites">
            <span>♡</span> Favourites
          </a>
          <a href="#profile">
            <span>◉</span> My profile
          </a>
        </nav>

        <button
          className={styles.sidebarButton}
          onClick={() => navigate("/")}
        >
          ← Back to website
        </button>
      </aside>

      <main className={styles.main} id="overview">
        <header className={styles.topbar}>
          <div>
            <span className={styles.muted}>YOUR PERSONAL RETREAT</span>
            <h1>Welcome back!</h1>
          </div>

          <button
            className={styles.profileButton}
            onClick={() => navigate("/login")}
          >
            <span className={styles.avatar}>G</span>
            <span>My account</span>
          </button>
        </header>

        <section className={styles.welcomeCard}>
          <div>
            <span className={styles.welcomeEyebrow}>
              YOUR NEXT ADVENTURE
            </span>
            <h2>Your next escape is waiting.</h2>
            <p>
              Find a peaceful lodge, plan a getaway, and
              keep all your reservations in one place.
            </p>

            <button
              className={styles.primaryButton}
              onClick={() => navigate("/stays")}
            >
              Explore stays →
            </button>
          </div>
        </section>

        <section className={styles.statsGrid}>
          <article className={styles.statCard}>
            <span>My bookings</span>
            <strong>{upcomingBookings.length}</strong>
            <small>Bookings shown in this demo</small>
          </article>

          <article className={styles.statCard}>
            <span>Upcoming stays</span>
            <strong>—</strong>
            <small>Connect your booking data</small>
          </article>

          <article className={styles.statCard}>
            <span>Saved favourites</span>
            <strong>—</strong>
            <small>Connect your favourites data</small>
          </article>
        </section>

        <section className={styles.panel} id="bookings">
          <div className={styles.panelHeading}>
            <div>
              <span className={styles.muted}>KEEP EVERYTHING IN ONE PLACE</span>
              <h2>My bookings</h2>
            </div>

            <button
              className={styles.textButton}
              onClick={() => navigate("/stays")}
            >
              Find another stay →
            </button>
          </div>

          {upcomingBookings.length > 0 ? (
            <div className={styles.bookingList}>
              {upcomingBookings.map((booking) => (
                <article className={styles.bookingRow} key={booking.id}>
                  <div className={styles.bookingIcon}>⌂</div>

                  <div className={styles.bookingDetails}>
                    <strong>{booking.stay}</strong>
                    <span>{booking.dates}</span>
                    <small>Reference: {booking.id}</small>
                  </div>

                  <span className={styles.status}>
                    {booking.status}
                  </span>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <span>⌂</span>
              <h3>Your next escape starts here</h3>
              <p>You haven't made any bookings yet.</p>
              <button
                className={styles.primaryButton}
                onClick={() => navigate("/stays")}
              >
                Browse accommodation
              </button>
            </div>
          )}
        </section>

        <section className={styles.quickLinks} id="favourites">
          <article>
            <span className={styles.quickIcon}>♡</span>
            <div>
              <h3>Your favourites</h3>
              <p>Keep your favourite places together.</p>
            </div>
            <button onClick={() => navigate("/favourites")}>
              View →
            </button>
          </article>

          <article id="profile">
            <span className={styles.quickIcon}>◉</span>
            <div>
              <h3>Your profile</h3>
              <p>Manage your personal details and preferences.</p>
            </div>
            <button onClick={() => navigate("/profile")}>
              Manage →
            </button>
          </article>
        </section>
      </main>
    </div>
  );
};

export default UserDashboard;