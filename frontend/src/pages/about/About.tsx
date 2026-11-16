import { Link } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import styles from "./About.module.css";

export default function About() {
  return (
    <div className={styles.page}>
      <Navbar />

      <main>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>THE STORY BEHIND WILDHAVEN</span>
            <h1>
              A better way to
              <br />
              <em>find your escape.</em>
            </h1>
            <p>
              WildHaven brings accommodation discovery and booking
              together in one place, helping travellers find stays
              where they can slow down, reconnect and enjoy meaningful
              experiences.
            </p>
            <Link to="/#stays" className={styles.primaryButton}>
              Explore our stays <span>↗</span>
            </Link>
          </div>

          <div className={styles.heroImage}>
            <img
              src="/images/hero-image.jpg"
              alt="A peaceful accommodation surrounded by nature"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          </div>
        </section>

        <section className={styles.story}>
          <div>
            <span className={styles.eyebrow}>OUR PURPOSE</span>
            <h2>More than a place to sleep.</h2>
          </div>

          <div className={styles.storyText}>
            <p>
              Finding the right accommodation should feel simple,
              welcoming and inspiring. WildHaven was created around
              that idea: making it easier to explore accommodation,
              compare rooms, manage reservations and plan your next stay.
            </p>

            <p>
              The platform brings together accommodation listings,
              room information, customer accounts, booking management,
              reviews, favourites and secure online payment verification.
              It is designed to make the experience clearer for both
              travellers and accommodation administrators.
            </p>
          </div>
        </section>

        <section className={styles.values}>
          <div className={styles.sectionHeading}>
            <span className={styles.eyebrow}>WHAT WE VALUE</span>
            <h2>Built around a better stay.</h2>
          </div>

          <div className={styles.valueGrid}>
            <article>
              <span>01</span>
              <h3>Discover with ease</h3>
              <p>
                Explore accommodation details, room options, facilities
                and pricing in one convenient experience.
              </p>
            </article>

            <article>
              <span>02</span>
              <h3>Book with confidence</h3>
              <p>
                Follow a clear reservation process and review your
                booking information from your account.
              </p>
            </article>

            <article>
              <span>03</span>
              <h3>Stay connected</h3>
              <p>
                Keep track of your reservations, saved accommodation
                and important booking updates.
              </p>
            </article>
          </div>
        </section>

        <section className={styles.creator}>
          <div className={styles.creatorImage}>
            <img
              src="/images/creator-placeholder.jpg"
              alt="Portrait of Scelo Mike Phoswa, creator of WildHaven"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />

            <div className={styles.imageFallback}>SMP</div>
          </div>

          <div className={styles.creatorContent}>
            <span className={styles.eyebrow}>MEET THE CREATOR</span>
            <h2>Scelo Mike Phoswa</h2>
            <p className={styles.creatorRole}>
              Creator & Full-Stack Developer
            </p>

            <p>
              WildHaven is a software development project created by
              Scelo Mike Phoswa. The project brings together frontend
              development, backend API design, database management,
              authentication, accommodation bookings and payment
              integration.
            </p>

            <p>
              The goal is to build a practical, user-friendly platform
              while applying full-stack development skills to a
              real-world accommodation booking experience.
            </p>

            <div className={styles.creatorLinks}>
              <a
                href="https://github.com/Qhathizwe"
                target="_blank"
                rel="noreferrer"
              >
                GitHub ↗
              </a>

              <a
                href="https://mi-portfolio-psi-six.vercel.app/"
                target="_blank"
                rel="noreferrer"
              >
                Portfolio ↗
              </a>
            </div>
          </div>
        </section>

        <section className={styles.closing}>
          <span className={styles.eyebrow}>YOUR NEXT CHAPTER STARTS HERE</span>
          <h2>Find a stay worth remembering.</h2>
          <Link to="/#stays" className={styles.primaryButton}>
            Find your stay <span>↗</span>
          </Link>
        </section>
      </main>

      <footer className={styles.footer}>
        <strong>WildHaven</strong>
        <span>Stay somewhere meaningful.</span>
      </footer>
    </div>
  );
}