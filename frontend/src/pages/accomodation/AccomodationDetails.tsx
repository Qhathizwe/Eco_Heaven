import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { getAccomodationsThunk } from "../../redux/features/accomodationSlice";
import { getRoomsByAccommodationThunk } from "../../redux/features/roomSlice";
import {
  addFavourite,
  removeFavourite,
  fetchFavourites,
} from "../../redux/features/favouriteSlice";

import Navbar from "../../components/navbar/Navbar";
import Review from "../../components/reviews/Reviews";

import styles from "./AccomodationDetails.module.css";
import heroPlaceholder from "../../assets/hero-image.jpg";

const API_ORIGIN = "http://localhost:7000";

const today = new Date();

const defaultCheckIn = new Date(today);
defaultCheckIn.setDate(today.getDate() + 1);

const defaultCheckOut = new Date(defaultCheckIn);
defaultCheckOut.setDate(defaultCheckIn.getDate() + 3);

// Declare PaystackPop globally for TypeScript
declare const PaystackPop: any;

/**
 * Convert a Date into the YYYY-MM-DD format required by date inputs.
 */
function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Safely convert arrays, comma-separated strings, or JSON arrays
 * into a string array.
 */
function parseList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  const trimmedValue = value.trim();

  try {
    const parsed: unknown = JSON.parse(trimmedValue);

    if (Array.isArray(parsed)) {
      return parsed
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  } catch {
    // Treat as comma-separated text if not JSON.
  }

  return trimmedValue
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Resolve image paths returned by the backend.
 */
function resolveImage(path: unknown): string {
  if (typeof path !== "string" || !path.trim()) {
    return heroPlaceholder;
  }

  const value = path.trim();

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  const normalized = value
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");

  return `${API_ORIGIN}/${normalized}`;
}

/**
 * Return the number of nights between two dates.
 */
function getNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) {
    return 0;
  }

  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end <= start
  ) {
    return 0;
  }

  return Math.round(
    (end.getTime() - start.getTime()) / 86400000
  );
}

const AccommodationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const accommodationId = Number(id);

  const [selectedRoom, setSelectedRoom] = useState<any>(null);

  const [checkInDate, setCheckInDate] = useState(
    toDateInputValue(defaultCheckIn)
  );

  const [checkOutDate, setCheckOutDate] = useState(
    toDateInputValue(defaultCheckOut)
  );

  const [guestsCount, setGuestsCount] = useState(2);
  const [bookingMessage, setBookingMessage] = useState("");
  const [galleryIndex, setGalleryIndex] = useState(0);

  const { accomodationList, isLoading: isAccomLoading } =
    useAppSelector((state) => state.accomodation);

  const { roomList, isLoading: isRoomsLoading } =
    useAppSelector((state) => state.room);

  // Access backend favourites state from Redux
  const { ids: favouriteIds } = useAppSelector((state) => state.favourite);
  const user = useAppSelector((state) => state.user);

  // Check if current accommodation ID is saved in Redux favourites state
  const isFavourite = favouriteIds.includes(accommodationId);

  // Find the accommodation currently being viewed.
  const accommodation = accomodationList.find(
    (item) => Number(item.id) === accommodationId
  );

  const userId = Number(
    (user as any)?.id ??
    (user as any)?.user?.id ??
    (user as any)?.user?.user_id ??
    0
  );

  const token = localStorage.getItem("token");

  const nights = getNights(checkInDate, checkOutDate);

  const pricePerNight = selectedRoom
    ? Number(selectedRoom.price_per_night) || 0
    : 0;

  const grandTotal = pricePerNight * nights;

  const pictures = useMemo(() => {
    const rawPictures: unknown = accommodation?.pictures;
    const values = parseList(rawPictures);

    const resolved = values.map((picture) => resolveImage(picture));

    return resolved.length > 0 ? resolved : [heroPlaceholder];
  }, [accommodation?.pictures]);

  const amenities = useMemo(() => {
    const rawAmenities: unknown = accommodation?.amenities;
    return parseList(rawAmenities);
  }, [accommodation?.amenities]);

  /**
   * Fetch accommodations if they are not already in Redux.
   */
  useEffect(() => {
    if (!Number.isInteger(accommodationId) || accommodationId <= 0) {
      return;
    }

    if (accomodationList.length === 0) {
      dispatch(getAccomodationsThunk());
    }
  }, [dispatch, accommodationId, accomodationList.length]);

  /**
   * Fetch rooms belonging to the selected accommodation.
   */
  useEffect(() => {
    if (Number.isInteger(accommodationId) && accommodationId > 0) {
      dispatch(getRoomsByAccommodationThunk(String(accommodationId)));
      setSelectedRoom(null);
    }
  }, [dispatch, accommodationId]);

  /**
   * Fetch user's saved favourites from backend on mount.
   */
  useEffect(() => {
    if (token) {
      dispatch(fetchFavourites());
    }
  }, [dispatch, token]);

  /**
   * Select the first available room if the selected room is no longer present.
   */
  useEffect(() => {
    if (roomList.length === 0) {
      setSelectedRoom(null);
      return;
    }

    const selectedStillExists = roomList.some(
      (room) => room.id === selectedRoom?.id
    );

    if (!selectedStillExists) {
      const firstAvailable = roomList.find(
        (room) => room.is_available !== false
      );

      setSelectedRoom(firstAvailable ?? roomList[0]);
    }
  }, [roomList, selectedRoom]);

  /**
   * Invalid accommodation URL.
   */
  if (!Number.isInteger(accommodationId) || accommodationId <= 0) {
    return (
      <div className={styles.page}>
        <Navbar />

        <main className={styles.statusPage}>
          <h1>Invalid accommodation</h1>
          <p>The accommodation link is not valid.</p>

          <button type="button" onClick={() => navigate("/")}>
            Browse stays
          </button>
        </main>
      </div>
    );
  }

  /**
   * Loading state.
   */
  if (isAccomLoading && !accommodation) {
    return (
      <div className={styles.page}>
        <Navbar />

        <main className={styles.statusPage}>
          <div className={styles.loader} />
          <p>Preparing your stay…</p>
        </main>
      </div>
    );
  }

  /**
   * Accommodation was not found.
   */
  if (!accommodation) {
    return (
      <div className={styles.page}>
        <Navbar />

        <main className={styles.statusPage}>
          <span className={styles.eyebrow}>WILDHAVEN STAYS</span>
          <h1>We couldn't find this stay</h1>
          <p>It may have been removed, or the link may be incorrect.</p>

          <button type="button" onClick={() => navigate("/")}>
            Explore accommodations
          </button>
        </main>
      </div>
    );
  }

  const address = [
    accommodation.address,
    accommodation.province,
    "South Africa",
  ]
    .filter(Boolean)
    .join(", ");

  const mapQuery = encodeURIComponent(
    `${accommodation.name}, ${address}`
  );

  const rating = Number(accommodation.star_rating) || 0;

  /**
   * Share the accommodation link.
   */
  function handleShare() {
    const shareUrl = window.location.href;

    if (navigator.share) {
      void navigator
        .share({
          title: accommodation?.name,
          text: `Take a look at ${accommodation?.name} on WildHaven.`,
          url: shareUrl,
        })
        .catch(() => { });
    } else if (navigator.clipboard) {
      void navigator.clipboard
        .writeText(shareUrl)
        .then(() => setBookingMessage("Accommodation link copied."))
        .catch(() => setBookingMessage("Unable to copy the link."));
    } else {
      setBookingMessage(`Share this link: ${shareUrl}`);
    }
  }

  /**
   * Save or remove the accommodation via Redux backend thunks.
   */
  async function handleToggleFavourite() {
    if (!token) {
      setBookingMessage("Please sign in to save stays to your profile.");
      navigate("/login");
      return;
    }

    try {
      if (isFavourite) {
        await dispatch(removeFavourite(accommodationId)).unwrap();
        setBookingMessage("Removed from your saved favourites.");
      } else {
        await dispatch(addFavourite(accommodationId)).unwrap();
        setBookingMessage("Saved to your profile favourites.");
      }
    } catch (error: any) {
      setBookingMessage(
        typeof error === "string" ? error : "Could not update favourite."
      );
    }
  }

  /**
   * Validate reservation details and initialize Paystack payment.
   */
  async function handleReserve() {
    setBookingMessage("");

    const currentToken = localStorage.getItem("token");

    if (!currentToken) {
      setBookingMessage("Please sign in before making a reservation.");
      navigate("/login");
      return;
    }

    if (!selectedRoom) {
      setBookingMessage("Please select a room first.");
      return;
    }

    if (selectedRoom.is_available === false) {
      setBookingMessage("This room is currently unavailable.");
      return;
    }

    if (nights <= 0) {
      setBookingMessage("Check-out must be after check-in.");
      return;
    }

    const todayValue = toDateInputValue(today);

    if (checkInDate < todayValue) {
      setBookingMessage("Check-in cannot be in the past.");
      return;
    }

    try {
      setBookingMessage("Initializing secure checkout...");

      // 1. Get payment session and authorization_url from backend
      const response = await fetch("http://localhost:7000/api/payments/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({
          email: (user as any)?.email || (user as any)?.user?.email || "guest@wildhaven.co.za",
          amount: grandTotal,
          bookingDetails: {
            accommodation_id: accommodationId,
            room_id: selectedRoom.id,
            check_in: checkInDate,
            check_out: checkOutDate,
            guests: guestsCount,
          },
        }),
      });

      const result = await response.json();

      if (!result.success || !result.data?.authorization_url) {
        setBookingMessage(result.message || "Failed to initialize checkout.");
        return;
      }

      //  Redirect user directly to Paystack's full-screen secure checkout page
      window.location.href = result.data.authorization_url;

    } catch (error: any) {
      console.error("Payment redirect error:", error);
      setBookingMessage("Unable to connect to payment server.");
    }
  }
  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.mainContent}>
        {/* Breadcrumb navigation */}
        <div className={styles.topBreadcrumb}>
          <button type="button" onClick={() => navigate("/")}>
            Stays
          </button>

          <span>/ South Africa</span>

          {accommodation.province && (
            <span>/ {accommodation.province}</span>
          )}

          <span>/</span>
          <strong>{accommodation.name}</strong>
        </div>

        {/* Accommodation heading */}
        <header className={styles.header}>
          <div className={styles.headerMain}>
            <span className={styles.eyebrow}>YOUR NEXT ESCAPE</span>

            <h1>{accommodation.name}</h1>

            <div className={styles.subHeaderInfo}>
              <span aria-hidden="true">⌖</span>
              <span>{address}</span>

              <a href="#location" className={styles.inlineMapLink}>
                View map
              </a>
            </div>

            <div className={styles.ratingsMeta}>
              {rating > 0 ? (
                <span className={styles.stars}>
                  ★ {rating.toFixed(1)} star classification
                </span>
              ) : (
                <span className={styles.muted}>
                  Rating not yet available
                </span>
              )}

              <span className={styles.dot}>•</span>

              <a href="#reviews" className={styles.reviewsCount}>
                Read guest reviews
              </a>
            </div>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.actionBtn}
              onClick={handleShare}
            >
              ↗ Share
            </button>

            <button
              type="button"
              className={`${styles.actionBtn} ${isFavourite ? styles.savedButton : ""
                }`}
              onClick={handleToggleFavourite}
              aria-pressed={isFavourite}
            >
              {isFavourite ? "♥ Saved" : "♡ Save"}
            </button>
          </div>
        </header>

        {/* Status and feedback messages */}
        {bookingMessage && (
          <div className={styles.notice} role="status">
            <span>{bookingMessage}</span>

            <button
              type="button"
              aria-label="Dismiss message"
              onClick={() => setBookingMessage("")}
            >
              ×
            </button>
          </div>
        )}

        {/* Photo gallery */}
        <section
          className={styles.gridGallery}
          aria-label="Accommodation photos"
        >
          <button
            type="button"
            className={styles.largeMainImg}
            onClick={() =>
              setGalleryIndex(
                (current) => (current + 1) % pictures.length
              )
            }
            aria-label="View next accommodation photo"
          >
            <img
              src={pictures[galleryIndex]}
              alt={`${accommodation.name} photo ${galleryIndex + 1}`}
            />
          </button>

          <div className={styles.sideImageStack}>
            <button
              type="button"
              className={styles.smallImg}
              onClick={() =>
                setGalleryIndex(
                  (current) => (current + 1) % pictures.length
                )
              }
            >
              <img
                src={pictures[(galleryIndex + 1) % pictures.length]}
                alt="Accommodation gallery view"
              />
            </button>

            <button
              type="button"
              className={styles.smallImgWithOverlay}
              onClick={() =>
                setGalleryIndex(
                  (current) => (current + 2) % pictures.length
                )
              }
            >
              <img
                src={pictures[(galleryIndex + 2) % pictures.length]}
                alt="Another accommodation view"
              />

              <span className={styles.allPhotosBtn}>
                View photos · {pictures.length}
              </span>
            </button>
          </div>
        </section>

        {/* Page section navigation */}
        <nav
          className={styles.subNavbar}
          aria-label="Accommodation sections"
        >
          <a href="#overview">Overview</a>
          <a href="#rooms">Rooms</a>
          <a href="#amenities">Amenities</a>
          <a href="#location">Location</a>
          <a href="#reviews">Reviews</a>
        </nav>

        <div className={styles.contentLayout}>
          <div className={styles.leftColumn}>
            {/* Overview */}
            <section id="overview" className={styles.sectionBlock}>
              <span className={styles.eyebrow}>
                WELCOME TO WILDHAVEN
              </span>

              <h2>Let your next escape begin here.</h2>

              <p className={styles.leadText}>
                {accommodation.description ||
                  "Discover a peaceful retreat, enjoy thoughtful comforts and make time for the experiences that matter."}
              </p>

              <div className={styles.propertyQuickIcons}>
                <span>⌂ Comfortable accommodation</span>
                <span>♧ A place to unwind</span>
                <span>✦ Make it your own escape</span>
              </div>
            </section>

            {/* Rooms */}
            <section id="rooms" className={styles.sectionBlock}>
              <span className={styles.eyebrow}>
                YOUR ROOM, YOUR WAY
              </span>

              <h2>Choose your kind of quiet.</h2>

              <p className={styles.sectionSub}>
                {checkInDate} to {checkOutDate} · {nights || "—"}{" "}
                night(s) · {guestsCount}{" "}
                {guestsCount === 1 ? "guest" : "guests"}
              </p>

              {isRoomsLoading ? (
                <div className={styles.inlineLoading}>
                  Loading room options…
                </div>
              ) : roomList.length === 0 ? (
                <div className={styles.noRooms}>
                  <h3>No rooms listed yet</h3>
                  <p>
                    Please check back later or contact the accommodation.
                  </p>
                </div>
              ) : (
                <div className={styles.roomCardsStack}>
                  {roomList.map((room) => {
                    const roomPictures: unknown = room.pictures;
                    const parsedRoomPictures = parseList(roomPictures);
                    const roomThumb = resolveImage(
                      parsedRoomPictures[0]
                    );

                    const isSelected = selectedRoom?.id === room.id;

                    return (
                      <article
                        key={room.id}
                        className={`${styles.roomSelectionCard} ${isSelected ? styles.cardSelected : ""
                          }`}
                      >
                        <div className={styles.roomCardThumb}>
                          <img
                            src={roomThumb}
                            alt={room.room_type || "Guest room"}
                            loading="lazy"
                          />
                        </div>

                        <div className={styles.roomCardContent}>
                          <div className={styles.roomCardTop}>
                            <h3>
                              {room.room_type || `Room ${room.id}`}
                            </h3>

                            <span
                              className={
                                isSelected
                                  ? styles.selectedBadgeText
                                  : styles.unselectedBadgeText
                              }
                            >
                              {isSelected
                                ? "Selected ✓"
                                : "Room option"}
                            </span>
                          </div>

                          <p className={styles.roomSpecs}>
                            {room.description ||
                              "A comfortable room for your stay."}
                          </p>

                          <p className={styles.roomPerks}>
                            Check the listed facilities and policies before
                            booking.
                          </p>

                          <div className={styles.roomCardPriceRow}>
                            <div>
                              <strong>
                                R{" "}
                                {Number(
                                  room.price_per_night || 0
                                ).toFixed(2)}
                              </strong>

                              <span className={styles.perNight}>
                                {" "}/ night
                              </span>
                            </div>

                            <button
                              type="button"
                              disabled={room.is_available === false}
                              className={
                                isSelected
                                  ? styles.selectedBtnActive
                                  : styles.selectBtnNormal
                              }
                              onClick={() => setSelectedRoom(room)}
                            >
                              {room.is_available === false
                                ? "Unavailable"
                                : isSelected
                                  ? "Selected ✓"
                                  : "Select room"}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Amenities */}
            <section id="amenities" className={styles.sectionBlock}>
              <span className={styles.eyebrow}>
                THE LITTLE EXTRAS
              </span>

              <h2>Considered comforts.</h2>

              {amenities.length > 0 ? (
                <div className={styles.amenitiesGridIcons}>
                  {amenities.map((item, index) => (
                    <div
                      key={`${item}-${index}`}
                      className={styles.amenityItem}
                    >
                      <span aria-hidden="true">✦</span>
                      {item}
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.muted}>
                  Amenities have not been added for this accommodation yet.
                </p>
              )}
            </section>

            {/* Map */}
            <section id="location" className={styles.sectionBlock}>
              <span className={styles.eyebrow}>FIND YOUR WAY</span>

              <h2>At the edge of the everyday.</h2>

              <p className={styles.addressLine}>{address}</p>

              {address ? (
                <>
                  <div className={styles.mapBox}>
                    <iframe
                      title={`Map of ${accommodation.name}`}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://maps.google.com/maps?q=${mapQuery}&z=13&output=embed`}
                    />
                  </div>

                  <a
                    className={styles.openMapLink}
                    href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open in Google Maps ↗
                  </a>

                  <p className={styles.mapHint}>
                    The map uses the accommodation address. Check the
                    exact location before travelling.
                  </p>
                </>
              ) : (
                <p className={styles.muted}>
                  Add an address to display the map.
                </p>
              )}
            </section>

            {/* Guest reviews */}
            <section id="reviews" className={styles.sectionBlock}>
              <span className={styles.eyebrow}>
                GUEST EXPERIENCES
              </span>

              <h2>Good words from memorable stays.</h2>

              <p className={styles.sectionSub}>
                Read guest feedback or share your own experience.
              </p>

              <Review accommodationId={accommodationId} />
            </section>
          </div>

          {/* Sticky reservation card */}
          <aside className={styles.rightColumn}>
            <div className={styles.stickyBookingCard}>
              <span className={styles.eyebrow}>
                YOUR STAY SUMMARY
              </span>

              <div className={styles.cardHeaderPrice}>
                <h3>
                  {selectedRoom
                    ? `R ${pricePerNight.toFixed(2)}`
                    : "Select a room"}
                </h3>

                {selectedRoom && <span>/ night</span>}
              </div>

              {selectedRoom && (
                <p className={styles.roomTypeSub}>
                  {selectedRoom.room_type ||
                    `Room ${selectedRoom.id}`}
                </p>
              )}

              <div className={styles.bookingInputsBox}>
                <div className={styles.inputGroup}>
                  <label htmlFor="check-in">CHECK-IN</label>

                  <input
                    id="check-in"
                    type="date"
                    value={checkInDate}
                    min={toDateInputValue(today)}
                    onChange={(event) => {
                      const nextCheckIn = event.target.value;

                      setCheckInDate(nextCheckIn);

                      if (checkOutDate <= nextCheckIn) {
                        const nextDay = new Date(
                          `${nextCheckIn}T00:00:00`
                        );

                        nextDay.setDate(nextDay.getDate() + 1);

                        setCheckOutDate(toDateInputValue(nextDay));
                      }
                    }}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="check-out">CHECK-OUT</label>

                  <input
                    id="check-out"
                    type="date"
                    value={checkOutDate}
                    min={checkInDate || toDateInputValue(today)}
                    onChange={(event) =>
                      setCheckOutDate(event.target.value)
                    }
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="guests">NUMBER OF GUESTS</label>

                  <select
                    id="guests"
                    value={guestsCount}
                    onChange={(event) =>
                      setGuestsCount(Number(event.target.value))
                    }
                  >
                    <option value={1}>1 Guest</option>
                    <option value={2}>2 Guests</option>
                  </select>
                </div>
              </div>

              {selectedRoom && nights > 0 && (
                <div className={styles.costBreakdown}>
                  <div className={styles.costRow}>
                    <span>
                      R {pricePerNight.toFixed(2)} × {nights} night(s)
                    </span>

                    <span>R {grandTotal.toFixed(2)}</span>
                  </div>

                  <div
                    className={`${styles.costRow} ${styles.totalRow}`}
                  >
                    <strong>Total room cost</strong>
                    <strong>R {grandTotal.toFixed(2)}</strong>
                  </div>
                </div>
              )}

              <button
                type="button"
                className={styles.reserveButtonMain}
                disabled={
                  !selectedRoom ||
                  selectedRoom.is_available === false ||
                  nights <= 0
                }
                onClick={handleReserve}
              >
                Continue reservation →
              </button>

              <p className={styles.secureNote}>
                Your reservation must be confirmed by the booking service.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <footer className={styles.footer}>
        <strong>WildHaven</strong>
        <p>Find your peace. Discover your stay.</p>
        <span>
          © {new Date().getFullYear()} WildHaven. All rights reserved.
        </span>
      </footer>
    </div>
  );
};

export default AccommodationDetails;