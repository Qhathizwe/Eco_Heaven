import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Navbar from "../../components/navbar/Navbar";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { getAccomodationsThunk } from "../../redux/features/accomodationSlice";
import { getRoomsByAccommodationThunk } from "../../redux/features/roomSlice";
import type { Rooms } from "../../types/app.types";

import styles from "./AccomodationDetails.module.css";
import heroPlaceholder from "../../assets/hero-image.jpg";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:7000/api"
).replace(/\/$/, "");

export default function AccommodationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    accomodationList,
    isLoading: accommodationLoading,
  } = useAppSelector((state) => state.accomodation);

  const {
    roomList,
    isLoading: roomsLoading,
  } = useAppSelector((state) => state.room);

  const { user, token, isAuthenticated } = useAppSelector(
    (state) => state.login,
  );

  const accommodation = accomodationList.find(
    (item) => String(item.id) === String(id),
  );

  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");

  const today = new Date();
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  useEffect(() => {
    if (accomodationList.length === 0) {
      void dispatch(getAccomodationsThunk());
    }
  }, [dispatch, accomodationList.length]);

  useEffect(() => {
    if (id) {
      setSelectedRoomId(null);
      void dispatch(getRoomsByAccommodationThunk(id));
    }
  }, [dispatch, id]);

  const availableRooms = useMemo(
    () => roomList.filter((room) => room.is_available),
    [roomList],
  );

  const selectedRoom: Rooms | undefined = availableRooms.find(
    (room) => room.id === selectedRoomId,
  );

  useEffect(() => {
    if (
      selectedRoomId === null &&
      availableRooms.length > 0
    ) {
      setSelectedRoomId(availableRooms[0].id);
    }
  }, [availableRooms, selectedRoomId]);

  const pictures = accommodation?.pictures?.length
    ? accommodation.pictures
    : [heroPlaceholder];

  const nights = useMemo(() => {
    if (!checkIn || !checkOut || checkOut <= checkIn) return 0;

    const start = new Date(`${checkIn}T00:00:00`);
    const end = new Date(`${checkOut}T00:00:00`);

    return Math.round(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
  }, [checkIn, checkOut]);

  const pricePerNight = Number(selectedRoom?.price_per_night || 0);
  const estimatedTotal = pricePerNight * nights;

  async function handleBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBookingError("");
    setBookingSuccess("");

    if (!isAuthenticated || !user || !token) {
      navigate("/login");
      return;
    }

    if (!accommodation || !selectedRoom) {
      setBookingError("Please choose an available room.");
      return;
    }

    if (!checkIn || !checkOut || checkIn < todayString || checkOut <= checkIn) {
      setBookingError("Choose valid check-in and check-out dates.");
      return;
    }

    if (guests < 1 || !Number.isInteger(guests)) {
      setBookingError("Please choose at least one guest.");
      return;
    }

    setBookingLoading(true);

    try {
      const response = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          accommodation_id: accommodation.id,
          room_id: selectedRoom.id,
          check_in: checkIn,
          check_out: checkOut,
          guests,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to submit your booking.");
      }

      setBookingSuccess(
        `Your booking request #${data.booking.id} has been submitted.`,
      );

      navigate("/my-bookings");
    } catch (error) {
      setBookingError(
        error instanceof Error
          ? error.message
          : "Could not connect to the booking server.",
      );
    } finally {
      setBookingLoading(false);
    }
  }

  if (accommodationLoading && accomodationList.length === 0) {
    return (
      <>
        <Navbar />
        <main className={styles.statePage}>Loading accommodation details…</main>
      </>
    );
  }

  if (!accommodation) {
    return (
      <>
        <Navbar />
        <main className={styles.statePage}>
          <h1>Stay not found</h1>
          <p>We couldn't find the accommodation you requested.</p>
          <Link to="/">Return to WildHaven</Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className={styles.page}>
        <p className={styles.breadcrumb}>
          <Link to="/">Home</Link> / Stays / {accommodation.province}
        </p>

        <header className={styles.heading}>
          <div>
            <p className={styles.eyebrow}>YOUR NEXT WILDHAVEN ESCAPE</p>
            <h1>{accommodation.name}</h1>
            <p className={styles.location}>
              {accommodation.address}, {accommodation.province}
            </p>
          </div>

          <div className={styles.rating}>
            <span>★</span>
            {Number(accommodation.star_rating).toFixed(1)}
            <small>/ 5</small>
          </div>
        </header>

        <section className={styles.gallery} aria-label="Accommodation photos">
          {pictures.slice(0, 5).map((picture, index) => (
            <img
              key={`${picture}-${index}`}
              src={picture}
              alt={`${accommodation.name} view ${index + 1}`}
              className={index === 0 ? styles.mainImage : styles.galleryImage}
              onError={(event) => {
                event.currentTarget.src = heroPlaceholder;
              }}
            />
          ))}
        </section>

        <div className={styles.content}>
          <section className={styles.information}>
            <p className={styles.eyebrow}>ABOUT THIS STAY</p>
            <h2>Space to rest, reconnect and explore.</h2>
            <p className={styles.description}>
              {accommodation.description ||
                "Discover a comfortable WildHaven stay and enjoy a memorable escape."}
            </p>

            <h3>Facilities and amenities</h3>
            {accommodation.amenities?.length ? (
              <div className={styles.amenities}>
                {accommodation.amenities.map((amenity) => (
                  <span key={amenity}>✓ {amenity}</span>
                ))}
              </div>
            ) : (
              <p>Contact the property for details about its amenities.</p>
            )}

            <h3>Choose your room</h3>

            {roomsLoading ? (
              <p>Loading available rooms…</p>
            ) : availableRooms.length === 0 ? (
              <div className={styles.emptyRooms}>
                No available rooms are listed for this stay at the moment.
              </div>
            ) : (
              <div className={styles.roomList}>
                {availableRooms.map((room) => (
                  <label
                    key={room.id}
                    className={`${styles.roomOption} ${
                      selectedRoomId === room.id ? styles.roomSelected : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="selectedRoom"
                      value={room.id}
                      checked={selectedRoomId === room.id}
                      onChange={() => setSelectedRoomId(room.id)}
                    />

                    <div>
                      <strong>{room.room_type}</strong>
                      <p>{room.description}</p>
                    </div>

                    <span className={styles.roomPrice}>
                      R {Number(room.price_per_night).toFixed(2)}
                      <small>/ night</small>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </section>

          <aside className={styles.bookingCard}>
            <p className={styles.eyebrow}>PLAN YOUR ESCAPE</p>
            <h2>
              R {pricePerNight.toFixed(2)}
              <small> / night</small>
            </h2>
            <p className={styles.bookingIntro}>
              Select your dates to request a reservation.
            </p>

            {bookingError && (
              <div className={styles.error} role="alert">{bookingError}</div>
            )}

            {bookingSuccess && (
              <div className={styles.success} role="status">{bookingSuccess}</div>
            )}

            <form className={styles.bookingForm} onSubmit={handleBooking}>
              <label htmlFor="checkIn">Check-in</label>
              <input
                id="checkIn"
                type="date"
                min={todayString}
                value={checkIn}
                onChange={(event) => {
                  setCheckIn(event.target.value);
                  if (checkOut && event.target.value >= checkOut) {
                    setCheckOut("");
                  }
                }}
                required
              />

              <label htmlFor="checkOut">Check-out</label>
              <input
                id="checkOut"
                type="date"
                min={checkIn || todayString}
                value={checkOut}
                onChange={(event) => setCheckOut(event.target.value)}
                required
              />

              <label htmlFor="guests">Guests</label>
              <select
                id="guests"
                value={guests}
                onChange={(event) => setGuests(Number(event.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
                  <option key={count} value={count}>
                    {count} {count === 1 ? "guest" : "guests"}
                  </option>
                ))}
              </select>

              {nights > 0 && (
                <div className={styles.priceSummary}>
                  <div>
                    <span>
                      R {pricePerNight.toFixed(2)} × {nights} night(s)
                    </span>
                    <strong>R {estimatedTotal.toFixed(2)}</strong>
                  </div>
                  <p>Estimate only. Taxes, fees and payment are not yet included.</p>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  bookingLoading ||
                  roomsLoading ||
                  availableRooms.length === 0 ||
                  !selectedRoom
                }
              >
                {bookingLoading
                  ? "Submitting request…"
                  : isAuthenticated
                    ? "Request a booking"
                    : "Sign in to book"}
              </button>

              <p className={styles.bookingFootnote}>
                Your request is pending until the property confirms it.
              </p>
            </form>
          </aside>
        </div>
      </main>
    </>
  );
}