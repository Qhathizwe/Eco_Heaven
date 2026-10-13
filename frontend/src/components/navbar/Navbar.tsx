
import { Link, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import logo from "../../assets/wildhaven.jpg";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <header className={styles.NavbarContainer}>
      <Link to="/" className={styles.brand} aria-label="WildHaven home">
        <img src={logo} alt="WildHaven logo" className={styles.Logo} />
      </Link>

      <nav className={styles.NavLinks} aria-label="Main navigation">
        <a href="/#stays" className={styles.NavLink}>
          Stays
        </a>
        <a href="/#philosophy" className={styles.NavLink}>
          Our Philosophy
        </a>
      </nav>

      <div className={styles.Actions}>
        <button
          onClick={() => navigate("/login")}
          className={styles.SignInButton}
        >
          Sign in
        </button>

        <button
          onClick={() => navigate("/register")}
          className={styles.SignUpButton}
        >
          Join us
        </button>
      </div>
    </header>
  );
};

export default Navbar;