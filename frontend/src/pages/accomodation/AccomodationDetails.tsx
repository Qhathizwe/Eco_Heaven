import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { getAccomodationsThunk } from "../../redux/features/accomodationSlice";
import { getRoomsByAccommodationThunk } from "../../redux/features/roomSlice";
import Navbar from "../../components/navbar/Navbar";
import styles from "./AccomodationDetails.module.css";
import heroPlaceholder from "../../assets/hero-image.jpg";

const AccommodationDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const [activeImage, setActiveImage] = useState<string>("");

    // Redux Selectors
    const { accomodationList, isLoading: isAccomLoading } = useAppSelector(
        (state) => state.accomodation
    );
    const { roomList, isLoading: isRoomsLoading } = useAppSelector(
        (state) => state.room
    );

    // Find target accommodation from Redux store or fetch if store is empty
    const accommodation = accomodationList.find(
        (item) => item.id === Number(id) || String(item.id) === id
    );

    useEffect(() => {
        if (accomodationList.length === 0) {
            dispatch(getAccomodationsThunk());
        }
    }, [dispatch, accomodationList.length]);

    useEffect(() => {
        if (id) {
            dispatch(getRoomsByAccommodationThunk(id));
        }
    }, [dispatch, id]);

    // Set default main hero picture once data loads
    useEffect(() => {
        if (accommodation?.pictures && accommodation.pictures.length > 0) {
            // 🌟 Use the Cloudinary URL directly without the localhost prefix!
            setActiveImage(accommodation.pictures[0]);
        }
    }, [accommodation]);


    if (isAccomLoading || !accommodation) {
        return (
            <div className={styles.page}>
                <Navbar />
                <div className={styles.loadingContainer}>
                    <p>Loading accommodation details...</p>
                </div>
            </div>
        );
    }

    const mainDisplayImage = activeImage || heroPlaceholder;

    return (
        <div className={styles.page}>
            <Navbar />

            <main className={styles.mainContent}>
                {/* Navigation Breadcrumb */}
                <button className={styles.backButton} onClick={() => navigate(-1)}>
                    ← Back to stays
                </button>

                {/* Accommodation Header */}
                <header className={styles.header}>
                    <div>
                        <span className={styles.locationTag}>📍 {accommodation.province} • {accommodation.address}</span>
                        <h1>{accommodation.name}</h1>
                    </div>
                    <div className={styles.ratingBadge}>
                        ★ {Number(accommodation.star_rating).toFixed(1)} Stars
                    </div>
                </header>

                {/* Media Gallery Section */}
                <section className={styles.gallerySection}>
                    <div className={styles.mainImageWrapper}>
                        <img src={mainDisplayImage} alt={accommodation.name} />
                    </div>
                    {accommodation.pictures && accommodation.pictures.length > 1 && (
                        <div className={styles.thumbnailGrid}>
                            {accommodation.pictures.map((pic, idx) => {
                                const imgUrl = `http://localhost:7000/${pic}`;
                                return (
                                    <img
                                        key={idx}
                                        src={imgUrl}
                                        alt={`${accommodation.name} thumbnail ${idx + 1}`}
                                        className={activeImage === imgUrl ? styles.activeThumb : ""}
                                        onClick={() => setActiveImage(imgUrl)}
                                    />
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Details Layout Grid */}
                <div className={styles.contentGrid}>
                    {/* Left Column: Description & Amenities */}
                    <div className={styles.detailsColumn}>
                        <section className={styles.cardSection}>
                            <h2>About this retreat</h2>
                            <p className={styles.descriptionText}>
                                {accommodation.description || "No description provided for this listing."}
                            </p>
                        </section>

                        {/* Amenities Grid */}
                        {accommodation.amenities && accommodation.amenities.length > 0 && (
                            <section className={styles.cardSection}>
                                <h2>Property Amenities</h2>
                                <div className={styles.amenitiesGrid}>
                                    {accommodation.amenities.map((amenity, idx) => (
                                        <div key={idx} className={styles.amenityChip}>
                                            ✦ {amenity}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Location Map Module */}
                        <section className={styles.cardSection}>
                            <h2>Location & Surroundings</h2>
                            <p className={styles.addressText}>{accommodation.address}, {accommodation.province}</p>
                            <div className={styles.mapContainer}>
                                <iframe
                                    title="Accommodation Location Map"
                                    width="100%"
                                    height="300"
                                    style={{ border: 0, borderRadius: "8px" }}
                                    loading="lazy"
                                    allowFullScreen
                                    src={`https://maps.google.com/maps?q=${encodeURIComponent(
                                        `${accommodation.name}, ${accommodation.address},${accommodation.province}`
                                    )}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                                />
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Rooms Inventory & Booking Selector */}
                    <div className={styles.roomsColumn}>
                        <div className={styles.stickyContainer}>
                            <h2>Available Rooms</h2>
                            {isRoomsLoading ? (
                                <p>Loading available rooms...</p>
                            ) : roomList.length === 0 ? (
                                <div className={styles.noRoomsCard}>
                                    <p>No rooms currently registered for this property.</p>
                                </div>
                            ) : (
                                <div className={styles.roomList}>
                                    {roomList.map((room) => {
                                        const roomThumb =
                                            room.pictures && room.pictures.length > 0
                                                ? `http://localhost:7000/uploads/${room.pictures[0]}`
                                                : heroPlaceholder;

                                        return (
                                            <div key={room.id} className={styles.roomCard}>
                                                <img
                                                    src={roomThumb}
                                                    alt={room.room_type}
                                                    className={styles.roomImg}
                                                />
                                                <div className={styles.roomInfo}>
                                                    <div className={styles.roomHeader}>
                                                        <h3>{room.room_type}</h3>
                                                        <span
                                                            className={
                                                                room.is_available
                                                                    ? styles.badgeAvailable
                                                                    : styles.badgeUnavailable
                                                            }
                                                        >
                                                            {room.is_available ? "Available" : "Booked"}
                                                        </span>
                                                    </div>
                                                    <p className={styles.roomDesc}>{room.description}</p>
                                                    <div className={styles.roomFooter}>
                                                        <div className={styles.priceTag}>
                                                            <strong>R {Number(room.price_per_night).toFixed(2)}</strong>
                                                            <span> / night</span>
                                                        </div>
                                                        <button
                                                            disabled={!room.is_available}
                                                            className={styles.bookBtn}
                                                            onClick={() => navigate(`/book/${room.id}`)}
                                                        >
                                                            {room.is_available ? "Reserve Room" : "Unavailable"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className={styles.footer}>
                <strong>WildHaven</strong>
                <p>Find your peace. Discover your stay.</p>
                <span>© {new Date().getFullYear()} WildHaven. All rights reserved.</span>
            </footer>
        </div>
    );
};

export default AccommodationDetails;