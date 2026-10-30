
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { getAccomodationsThunk } from "../../redux/features/accomodationSlice";
import {
  addFavourite,
  fetchFavourites,
  removeFavourite,
} from "../../redux/features/favouriteSlice";
import Navbar from "../../components/navbar/Navbar";
import styles from "./LandingPage.module.css";
import hero from "../../assets/hero-image.jpg";

// const API_URL =
//   import.meta.env.VITE_API_URL || "http://localhost:7000/api";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(price);
}

const LandingPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("All destinations");

  const { accomodationList, isLoading } = useAppSelector(
    (state) => state.accomodation
  );

  const { ids: favouriteIds } = useAppSelector(
    (state) => state.favourite
  );

  const { isAuthenticated } = useAppSelector((state) => state.login);

  useEffect(() => {
    dispatch(getAccomodationsThunk());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchFavourites());
  }, [dispatch, isAuthenticated]);

  const provinces = useMemo(
    () => [
      "All destinations",
      ...Array.from(
        new Set(
          accomodationList
            .map((stay) => stay.province)
            .filter(Boolean)
        )
      ).sort(),
    ],
    [accomodationList]
  );

  const filteredStays = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return accomodationList.filter((stay) => {
      const matchesText =
        !term ||
        stay.name.toLowerCase().includes(term) ||
        stay.province.toLowerCase().includes(term) ||
        stay.address.toLowerCase().includes(term);

      const matchesProvince =
        provinceFilter === "All destinations" ||
        stay.province === provinceFilter;

      return matchesText && matchesProvince;
    });
  }, [accomodationList, searchTerm, provinceFilter]);

  async function toggleFavourite(id: number) {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (favouriteIds.includes(id)) {
      await dispatch(removeFavourite(id));
    } else {
      await dispatch(addFavourite(id));
    }
  }

  // async function getStartingPrice (id: number): Promise<number | null> {
  //   try {
  //     const response = await fetch(
  //       `${API_URL}/accommodations/${id}/rooms`
  //     );
  //     if (!response.ok) return null;

  //     const result = await response.json();
  //     const rooms = Array.isArray(result) ? result : result.data ?? [];
  //     const available = rooms.filter(
  //       (room: { is_available: boolean; price_per_night: number }) =>
  //         room.is_available
  //     );

  //     if (!available.length) return null;

  //     return Math.min(
  //       ...available.map(
  //         (room: { price_per_night: number }) =>
  //           Number(room.price_per_night)
  //       )
  //     );
  //   } catch {
  //     return null;
  //   }
  // }

  return (
    <div className={styles.page}>
      <Navbar />

      <main>
        <section className={styles.hero}>
          <img
            src={hero}
            alt="A peaceful lodge surrounded by nature"
            className={styles.heroImage}
          />
          <div className={styles.heroOverlay} />

          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>
              THOUGHTFULLY SELECTED STAYS
            </span>

            <h1>
              Find your place
              <br />
              <em>to slow down.</em>
            </h1>

            <p>
              Discover distinctive lodges, quiet escapes, and
              memorable places to stay across South Africa.
            </p>

            <button
              className={styles.primaryButton}
              onClick={() =>
                document.getElementById("stays")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
            >
              Explore stays <span aria-hidden="true">↗</span>
            </button>

            <div className={styles.heroFootnote}>
              <span>Nature-led escapes</span>
              <span>Comfort worth travelling for</span>
            </div>
          </div>

          <div className={styles.heroCaption}>
            <span>WILDHAVEN COLLECTION</span>
            <strong>Space to breathe.</strong>
          </div>
        </section>

        <section className={styles.introSection}>
          <span className={styles.eyebrowDark}>THE ART OF GETTING AWAY</span>
          <h2>Not just somewhere to stay.</h2>
          <p>
            A considered collection of places where thoughtful
            details, natural beauty, and genuine hospitality come together.
          </p>
        </section>

        <section className={styles.staysSection} id="stays">
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrowDark}>FIND YOUR NEXT ESCAPE</span>
              <h2>Stays worth discovering</h2>
              <p>
                Explore hand-picked accommodation for your next memorable trip.
              </p>
            </div>

            <span className={styles.collectionCount}>
              {filteredStays.length} places
            </span>
          </div>

          <div className={styles.searchPanel}>
            <label className={styles.searchField}>
              <span>Search stays</span>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Name, town or destination"
              />
            </label>

            <label className={styles.searchField}>
              <span>Destination</span>
              <select
                value={provinceFilter}
                onChange={(event) => setProvinceFilter(event.target.value)}
              >
                {provinces.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {isLoading ? (
            <div className={styles.stateMessage}>Discovering beautiful stays…</div>
          ) : filteredStays.length === 0 ? (
            <div className={styles.stateMessage}>
              No stays match your search. Try a different destination.
            </div>
          ) : (
            <div className={styles.stayGrid}>
              {filteredStays.map((stay) => (
                <StayCard
                  key={stay.id}
                  stay={stay}
                  isFavourite={favouriteIds.includes(stay.id)}
                  onFavourite={() => toggleFavourite(stay.id)}
                  onOpen={() => navigate(`/stays/${stay.id}`)}
                />
              ))}
            </div>
          )}
        </section>

        <section className={styles.promiseSection}>
          <div>
            <span className={styles.eyebrow}>THE WILDHAVEN PROMISE</span>
            <h2>Find somewhere that feels different.</h2>
          </div>
          <p>
            From peaceful nature retreats to considered boutique stays,
            discover places made for meaningful moments away.
          </p>
        </section>
      </main>

      <footer className={styles.footer}>
        <strong>WildHaven</strong>
        <span>Stay somewhere meaningful.</span>
      </footer>
    </div>
  );
};

interface StayCardProps {
  stay: {
    id: number;
    name: string;
    description?: string;
    province: string;
    address: string;
    star_rating: number;
    pictures?: string[];
    amenities: string[];
  };
  isFavourite: boolean;
  onFavourite: () => void;
  onOpen: () => void;
}

function StayCard({
  stay,
  isFavourite,
  onFavourite,
  onOpen,
}: StayCardProps) {
  const [startingPrice, setStartingPrice] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadPrice() {
      try {
        const apiUrl =
          import.meta.env.VITE_API_URL || "http://localhost:7000/api";
        const response = await fetch(
          `${apiUrl}/accommodations/${stay.id}/rooms`
        );

        if (!response.ok) return;

        const result = await response.json();
        const rooms = Array.isArray(result) ? result : result.data ?? [];
        const prices = rooms
          .filter(
            (room: { is_available: boolean; price_per_night: number }) =>
              room.is_available
          )
          .map((room: { price_per_night: number }) =>
            Number(room.price_per_night)
          )
          .filter((price: number) => Number.isFinite(price) && price > 0);

        if (active && prices.length) setStartingPrice(Math.min(...prices));
      } finally {
        if (active) setPriceLoading(false);
      }
    }

    void loadPrice();
    return () => {
      active = false;
    };
  }, [stay.id]);

  const image = stay.pictures?.[0] || hero;
  const amenities = (stay.amenities || []).slice(0, 3);

  return (
    <article className={styles.stayCard}>
      <div className={styles.stayImageWrapper}>
        <button
          type="button"
          className={styles.imageButton}
          onClick={onOpen}
          aria-label={`View ${stay.name}`}
        >
          <img src={image} alt={stay.name} loading="lazy" />
        </button>

        <span className={styles.ratingBadge}>
          <span aria-hidden="true">★</span>{" "}
          {Number(stay.star_rating || 0).toFixed(1)}
        </span>

        <button
          type="button"
          className={`${styles.favouriteButton} ${
            isFavourite ? styles.favouriteActive : ""
          }`}
          onClick={onFavourite}
          aria-label={
            isFavourite
              ? `Remove ${stay.name} from favourites`
              : `Add ${stay.name} to favourites`
          }
        >
          {isFavourite ? "♥" : "♡"}
        </button>
      </div>

      <div className={styles.stayInfo}>
        <span className={styles.stayLocation}>
          <span aria-hidden="true">⌖</span> {stay.province}
        </span>

        <h3>{stay.name}</h3>
        <p className={styles.stayDescription}>
          {stay.description || stay.address}
        </p>

        <div className={styles.amenities}>
          {amenities.length ? (
            amenities.map((amenity) => (
              <span key={amenity}>{amenity}</span>
            ))
          ) : (
            <span>Comfortable accommodation</span>
          )}
        </div>

        <div className={styles.cardBottom}>
          <div className={styles.priceBlock}>
            <span>Starting from</span>
            <strong>
              {priceLoading
                ? "Checking…"
                : startingPrice !== null
                  ? formatPrice(startingPrice)
                  : "Price on request"}
            </strong>
            {startingPrice !== null && <small>per night</small>}
          </div>

          <button
            type="button"
            className={styles.viewButton}
            onClick={onOpen}
          >
            View stay <span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default LandingPage;