
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import styles from "./LandingPage.module.css";

import hero from "../../assets/hero-image.jpg";
import search from "../../assets/search.png";

const stays = [
  {
    name: "Luxury Forest Lodge",
    location: "Nature & tranquillity",
    image: hero,
    description:
      "Relax in a peaceful setting surrounded by beautiful natural scenery.",
  },
  {
    name: "Safari Escape",
    location: "Wildlife & adventure",
    image: hero,
    description:
      "Discover a memorable escape with the beauty of the outdoors.",
  },
  {
    name: "Private Retreat",
    location: "Comfort & privacy",
    image: hero,
    description:
      "Enjoy a relaxing getaway designed for comfort and connection.",
  },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <Navbar />

      <main>
        <section className={styles.hero}>
          <img
            src={hero}
            alt="Beautiful lodge surrounded by nature"
            className={styles.heroImage}
          />

          <div className={styles.heroOverlay} />

          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>
              YOUR NEXT ESCAPE STARTS HERE
            </span>

            <h1>
              Find your peace.
              <br />
              <span>Discover your stay.</span>
            </h1>

            <p>
              Escape the ordinary and discover beautiful places
              to rest, reconnect, and experience nature.
            </p>

            <button
              className={styles.findStaysBtn}
              onClick={() =>
                document
                  .getElementById("stays")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <img src={search} alt="" />
              Find a stay
            </button>

            <div className={styles.heroNote}>
              <span>✦ Carefully selected stays</span>
              <span>✦ Memorable experiences</span>
            </div>
          </div>

          <div className={styles.heroBadge}>
            <span>YOUR ESCAPE</span>
            <strong>Begins here.</strong>
          </div>
        </section>

        <section className={styles.intro} id="philosophy">
          <span className={styles.sectionLabel}>OUR PHILOSOPHY</span>
          <h2>More than a stay. A feeling.</h2>
          <p>
            We believe the best escapes bring you closer to
            nature, comfort, and the moments that matter.
            Discover places where you can slow down and feel
            at home away from home.
          </p>
        </section>

        <section className={styles.staysSection} id="stays">
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionLabel}>
                EXPLORE OUR COLLECTION
              </span>
              <h2>Find your perfect escape</h2>
            </div>

            <button
              className={styles.outlineButton}
              onClick={() => navigate("/stays")}
            >
              Explore all stays →
            </button>
          </div>

          <div className={styles.stayGrid}>
            {stays.map((stay) => (
              <article className={styles.stayCard} key={stay.name}>
                <div className={styles.stayImageWrapper}>
                  <img src={stay.image} alt={stay.name} />
                  <span className={styles.stayTag}>
                    Nature escape
                  </span>
                </div>

                <div className={styles.stayInfo}>
                  <span className={styles.stayLocation}>
                    {stay.location}
                  </span>
                  <h3>{stay.name}</h3>
                  <p>{stay.description}</p>

                  <button
                    className={styles.cardLink}
                    onClick={() => navigate("/stays")}
                  >
                    Discover this stay <span>→</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.ctaSection}>
          <div>
            <span className={styles.sectionLabel}>
              YOUR NEXT CHAPTER
            </span>
            <h2>Ready to get away?</h2>
            <p>
              Your perfect retreat is waiting to be discovered.
            </p>
          </div>

          <button
            className={styles.ctaButton}
            onClick={() => navigate("/register")}
          >
            Create an account →
          </button>
        </section>
      </main>

      <footer className={styles.footer}>
        <strong>WildHaven</strong>
        <p>Find your peace. Discover your stay.</p>
        <span>© {new Date().getFullYear()} WildHaven. All rights reserved.</span>
      </footer>
    </div>
  );
};

export default LandingPage;