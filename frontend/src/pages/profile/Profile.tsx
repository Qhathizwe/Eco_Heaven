import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import Navbar from "../../components/navbar/Navbar";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";

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
import hero from "../../assets/hero-image.jpg";

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

function formatDate(value: string | Date) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ProfilePage() {
  const dispatch = useAppDispatch();

  const {
    profile,
    isLoading: isProfileLoading,
    isSaving,
    error: profileError,
    successMessage,
  } = useAppSelector((state) => state.profile);

  const {
    items: favourites,
    isLoading: isFavLoading,
    error: favouriteError,
  } = useAppSelector((state) => state.favourite);

  const {
    userBookings,
    isLoading: isBookingsLoading,
  } = useAppSelector((state) => state.booking);

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    void dispatch(getProfileThunk());
    void dispatch(fetchFavourites());
    void dispatch(getMyBookingsThunk());

    return () => {
      dispatch(clearProfileMessages());
    };
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setName(profile.first_name || "");
      setSurname(profile.last_name || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  async function handleUpdateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await dispatch(
      updateProfileThunk({
        first_name: name.trim(),
        last_name: surname.trim(),
        email: profile?.email || "",
        phone: phone.trim(),
      }),
    );
  }

  async function handleRemoveFavourite(id: number) {
    await dispatch(removeFavourite(id));
  }

  const displayName =
    `${name} ${surname}`.trim() || "WildHeaven guest";

  const initials = displayName
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (isProfileLoading && !profile) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.loadingPage}>
          <div className={styles.loader} />
          <p>Preparing your account...</p>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.container}>
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>YOUR PERSONAL SPACE</span>
            <h1>My account</h1>
            <p>
              Manage your information, revisit saved accommodation and
              keep track of your reservations.
            </p>
          </div>

          <Link to="/#stays" className={styles.exploreLink}>
            Explore stays <span>↗</span>
          </Link>
        </header>

        {profileError && (
          <div className={styles.alertError} role="alert">
            {profileError}
          </div>
        )}

        {successMessage && (
          <div className={styles.alertSuccess} role="status">
            {successMessage}
          </div>
        )}

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <section className={styles.identityCard}>
              <div className={styles.avatar}>
                {profile?.profile_image ? (
                  <img src={profile.profile_image} alt={displayName} />
                ) : (
                  initials
                )}
              </div>

              <h2>{displayName}</h2>
              <p>{profile?.email}</p>

              <span className={styles.memberBadge}>
                {profile?.role === "admin" ? "Administrator" : "Guest account"}
              </span>

              <div className={styles.identityStats}>
                <div>
                  <strong>{favourites.length}</strong>
                  <span>Saved stays</span>
                </div>

                <div>
                  <strong>{userBookings.length}</strong>
                  <span>Bookings</span>
                </div>
              </div>
            </section>

            <nav className={styles.profileNav}>
              <a href="#personal-details">Personal details</a>
              <a href="#favourites">Saved accommodation</a>
              <a href="#bookings">My bookings</a>
            </nav>
          </aside>

          <div className={styles.content}>
            <section id="personal-details" className={styles.panel}>
              <div className={styles.panelHeading}>
                <div>
                  <span className={styles.eyebrow}>ACCOUNT INFORMATION</span>
                  <h2>Personal details</h2>
                  <p>Keep your contact information up to date.</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile}>
                <div className={styles.formGrid}>
                  <label className={styles.field}>
                    First name
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      autoComplete="given-name"
                      maxLength={100}
                      required
                    />
                  </label>

                  <label className={styles.field}>
                    Surname
                    <input
                      value={surname}
                      onChange={(event) => setSurname(event.target.value)}
                      autoComplete="family-name"
                      maxLength={100}
                      required
                    />
                  </label>

                  <label className={styles.field}>
                    Email address
                    <input
                      type="email"
                      value={profile?.email || ""}
                      disabled
                    />
                    <small>Contact support if you need to change your email.</small>
                  </label>

                  <label className={styles.field}>
                    Phone number
                    <input
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      autoComplete="tel"
                      maxLength={30}
                      required
                    />
                  </label>
                </div>

                <div className={styles.formFooter}>
                  <button
                    type="submit"
                    className={styles.primaryButton}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving changes..." : "Save changes"}
                  </button>
                </div>
              </form>
            </section>

            <section id="favourites" className={styles.panel}>
              <div className={styles.panelHeading}>
                <div>
                  <span className={styles.eyebrow}>YOUR SHORTLIST</span>
                  <h2>Saved accommodation</h2>
                  <p>
                    The places you have saved for a future getaway.
                  </p>
                </div>

                <span className={styles.countBadge}>
                  {favourites.length} saved
                </span>
              </div>

              {isFavLoading && (
                <p className={styles.stateMessage}>Loading your saved stays...</p>
              )}

              {!isFavLoading && favouriteError && (
                <p className={styles.errorText}>{favouriteError}</p>
              )}

              {!isFavLoading && !favouriteError && favourites.length === 0 && (
                <div className={styles.emptyState}>
                  <span>♡</span>
                  <h3>Your shortlist is waiting.</h3>
                  <p>
                    Save accommodation you like and it will appear here.
                  </p>
                  <Link to="/#stays" className={styles.primaryButton}>
                    Discover stays
                  </Link>
                </div>
              )}

              {!isFavLoading && favourites.length > 0 && (
                <div className={styles.favouritesGrid}>
                  {favourites.map((item) => (
                    <article
                      className={styles.favouriteCard}
                      key={item.id}
                    >
                      <Link
                        to={`/stays/${item.id}`}
                        className={styles.favouriteImage}
                      >
                        <img
                          src={getImage(item.pictures)}
                          alt={item.name}
                          loading="lazy"
                        />
                      </Link>

                      <div className={styles.favouriteBody}>
                        <div className={styles.favouriteMeta}>
                          <span>{item.province || "South Africa"}</span>
                          {Number(item.star_rating) > 0 && (
                            <span>
                              ★ {Number(item.star_rating).toFixed(1)}
                            </span>
                          )}
                        </div>

                        <h3>{item.name}</h3>

                        <p>
                          {item.address || item.description || "Explore this stay"}
                        </p>

                        <div className={styles.favouriteActions}>
                          <Link to={`/stays/${item.id}`}>
                            View stay <span>→</span>
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              void handleRemoveFavourite(item.id)
                            }
                            aria-label={`Remove ${item.name} from saved stays`}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section id="bookings" className={styles.panel}>
              <div className={styles.panelHeading}>
                <div>
                  <span className={styles.eyebrow}>YOUR TRAVEL HISTORY</span>
                  <h2>Recent bookings</h2>
                  <p>Review your latest reservations and their status.</p>
                </div>

                <Link to="/my-bookings" className={styles.textLink}>
                  View all bookings →
                </Link>
              </div>

              {isBookingsLoading && (
                <p className={styles.stateMessage}>Loading bookings...</p>
              )}

              {!isBookingsLoading && userBookings.length === 0 && (
                <div className={styles.emptyState}>
                  <span>⌂</span>
                  <h3>No bookings yet</h3>
                  <p>Your reservations will appear here after you book a stay.</p>
                  <Link to="/#stays" className={styles.primaryButton}>
                    Find a stay
                  </Link>
                </div>
              )}

              {!isBookingsLoading && userBookings.length > 0 && (
                <div className={styles.bookingList}>
                  {userBookings.slice(0, 3).map((booking) => (
                    <article
                      className={styles.bookingItem}
                      key={booking.id}
                    >
                      <img
                        src={getImage(booking.accommodation_pictures)}
                        alt={booking.accommodation_name || "Accommodation"}
                      />

                      <div className={styles.bookingInfo}>
                        <strong>
                          {booking.accommodation_name || `Booking #${booking.id}`}
                        </strong>
                        <span>
                          {formatDate(booking.check_in)} –{" "}
                          {formatDate(booking.check_out)}
                        </span>
                        <small>
                          {booking.room_type || "Selected room"} ·{" "}
                          {booking.guests} guests
                        </small>
                      </div>

                      <span
                        className={`${styles.bookingStatus} ${
                          styles[String(booking.status).toLowerCase()] || ""
                        }`}
                      >
                        {booking.status}
                      </span>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}