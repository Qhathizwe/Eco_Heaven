import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store"; // Adjust path to store
import {
  getProfileThunk,
  updateProfileThunk,
  clearProfileMessages,
} from "../../redux/features/profileSlice";
import {
  fetchFavourites,
  removeFavourite,
} from "../../redux/features/favouriteSlice";
import { getMyBookingsThunk } from "../../redux/features/BookingsSlice";
import styles from "./Profile.module.css";

const ProfilePage = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state hooks
  const { profile, isLoading: isProfileLoading, isSaving, error: profileError, successMessage } = useSelector(
    (state: RootState) => state.profile
  );
  const { items: favourites, isLoading: isFavLoading } = useSelector(
    (state: RootState) => state.favourite
  );
  
  // 🟢 Destructure userBookings (instead of bookings)
  const { userBookings, isLoading: isBookingsLoading } = useSelector(
    (state: RootState) => state.booking
  );

  // Local form state
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [phone, setPhone] = useState("");

  // Load profile, favourites, and logged-in user's bookings on mount
  useEffect(() => {
    void dispatch(getProfileThunk());
    void dispatch(fetchFavourites());
    void dispatch(getMyBookingsThunk()); // 🟢 Fetch user bookings safely

    return () => {
      dispatch(clearProfileMessages());
    };
  }, [dispatch]);

  // Sync profile data to input fields
  useEffect(() => {
    if (profile) {
      setName(profile.first_name || profile.first_name || "");
      setSurname(profile.last_name || profile.last_name || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(
      updateProfileThunk({
        first_name: name.trim(),
        last_name: surname.trim(),
        email: profile?.email || "",
        phone: phone.trim(),
      })
    );
  };

  if (isProfileLoading && !profile) {
    return (
      <main className={styles.page}>
        <div className={styles.loading}>Loading your profile…</div>
      </main>
    );
  }

  const displayName = `${name} ${surname}`.trim() || "WildHaven guest";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <div>
            <span className={styles.eyebrow}>YOUR WILDHAVEN ACCOUNT</span>
            <h1>My profile</h1>
            <p>Manage your personal details, view saved stays, and check your bookings.</p>
          </div>
          <Link to="/" className={styles.backLink}>
            ← Explore stays
          </Link>
        </header>

        {profileError && <div className={styles.errorMessage} role="alert">{profileError}</div>}
        {successMessage && <div className={styles.successMessage} role="status">{successMessage}</div>}

        <div className={styles.layout}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.identityCard}>
              <div className={styles.avatar}>
                {profile?.profile_image ? (
                  <img src={profile.profile_image} alt={displayName} />
                ) : (
                  initials || "G"
                )}
              </div>
              <h2>{displayName}</h2>
              <p>{profile?.email}</p>
              <span className={styles.memberBadge}>{profile?.role || "Guest"}</span>
            </div>

            <nav className={styles.profileNav} aria-label="Profile section links">
              <a className={styles.activeNav} href="#personal-details">
                Personal details
              </a>
              <a href="#favourites">
                My favourites ({favourites.length})
              </a>
              <a href="#bookings">
                My bookings ({userBookings.length})
              </a>
            </nav>
          </aside>

          {/* Main Content Sections */}
          <div className={styles.mainContent}>
            {/* 1. Edit Profile Form */}
            <section id="personal-details" className={styles.panel}>
              <div className={styles.panelHeading}>
                <h2>Personal information</h2>
                <p>Keep your contact details up to date.</p>
              </div>

              <form onSubmit={handleUpdateProfile}>
                <div className={styles.formGrid}>
                  <label className={styles.field}>
                    First name
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={100}
                      required
                    />
                  </label>

                  <label className={styles.field}>
                    Surname
                    <input
                      value={surname}
                      onChange={(e) => setSurname(e.target.value)}
                      maxLength={100}
                    />
                  </label>

                  <label className={styles.field}>
                    Email address
                    <input value={profile?.email || ""} disabled type="email" />
                    <small>Email cannot be changed directly.</small>
                  </label>

                  <label className={styles.field}>
                    Phone number
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      type="tel"
                      maxLength={30}
                    />
                  </label>
                </div>

                <div className={styles.formFooter}>
                  <button
                    className={styles.primaryButton}
                    type="submit"
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </form>
            </section>

            {/* 2. My Favourites Section */}
            <section id="favourites" className={styles.panel}>
              <div className={styles.panelHeading}>
                <h2>My favourite stays</h2>
                <p>Accommodations you have saved for future trips.</p>
              </div>

              {isFavLoading ? (
                <p>Loading favourites…</p>
              ) : favourites.length === 0 ? (
                <div className={styles.emptyFavourites}>
                  <p>You haven't saved any stays yet.</p>
                  <Link to="/" className={styles.primaryButton}>Discover stays</Link>
                </div>
              ) : (
                <div className={styles.favouritesGrid}>
                  {favourites.map((item) => (
                    <article key={item.id} className={styles.favouriteCard}>
                      <h3>{item.name}</h3>
                      <p>{item.address || item.province}</p>
                      <button
                        type="button"
                        className={styles.removeFavourite}
                        onClick={() => void dispatch(removeFavourite(item.id))}
                      >
                        Remove from favourites
                      </button>
                      <Link to={`/accommodation/${item.id}`} className={styles.detailsLink}>
                        View accommodation →
                      </Link>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* 3. My Bookings Section */}
            <section id="bookings" className={styles.panel}>
              <div className={styles.panelHeading}>
                <h2>My bookings</h2>
                <p>Review your active and past reservations.</p>
              </div>

              {isBookingsLoading ? (
                <p>Loading bookings…</p>
              ) : userBookings.length === 0 ? (
                <div className={styles.emptyFavourites}>
                  <p>You have no active bookings at this time.</p>
                  <Link to="/" className={styles.primaryButton}>Book a stay</Link>
                </div>
              ) : (
                <div className={styles.favouritesGrid}>
                  {userBookings.map((booking) => (
                    <article key={booking.id} className={styles.favouriteCard}>
                      <h3>{booking.accommodation_name || `Booking #${booking.id}`}</h3>
                      <p><strong>Room:</strong> {booking.room_type || "Standard Room"}</p>
                      <p><strong>Check-in:</strong> {new Date(booking.check_in).toISOString().slice(0, 10)}</p>
                      <p><strong>Check-out:</strong> {new Date(booking.check_out).toISOString().slice(0, 10)}</p>
                      <span className={styles.memberBadge}>
                        Status: {booking.status}
                      </span>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;