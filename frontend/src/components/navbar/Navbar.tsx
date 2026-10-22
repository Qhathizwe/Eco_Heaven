import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { logOut } from "../../redux/features/loginSlice";
import styles from "./Navbar.module.css";
import logo from "../../assets/wildhaven.jpg";

export default function Navbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.login);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
    };
  }, []);

  const isLoggedIn = isAuthenticated && Boolean(user);
  const isAdmin = user?.role === "admin";

  function logout() {
    dispatch(logOut());
    setMenuOpen(false);
    navigate("/", { replace: true });
  }

  function goTo(path: string) {
    setMenuOpen(false);
    navigate(path);
  }

  return (
    <header className={styles.navbar}>
      <Link
        to="/"
        className={styles.brand}
        aria-label="WildHaven home"
        onClick={() => setMenuOpen(false)}
      >
        <img src={logo} alt="" className={styles.logo} />
        <span>WildHaven</span>
      </Link>

      <nav className={styles.links} aria-label="Main navigation">
        <Link to="/#stays" className={styles.navLink}>Explore stays</Link>
        <Link to="/#philosophy" className={styles.navLink}>Our philosophy</Link>
        {isLoggedIn && !isAdmin && (
          <Link to="/my-bookings" className={styles.navLink}>
            My bookings
          </Link>
        )}
      </nav>

      <div className={styles.actions}>
        {!isLoggedIn ? (
          <>
            <button
              type="button"
              className={styles.signIn}
              onClick={() => navigate("/login")}
            >
              Sign in
            </button>
            <button
              type="button"
              className={styles.join}
              onClick={() => navigate("/register")}
            >
              Join WildHaven
            </button>
          </>
        ) : (
          <div className={styles.profile} ref={menuRef}>
            <button
              type="button"
              className={styles.profileButton}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className={styles.avatar}>
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </span>
              <span className={styles.profileName}>
                {user?.name || "My account"}
              </span>
              <span aria-hidden="true">⌄</span>
            </button>

            {menuOpen && (
              <div className={styles.menu} role="menu">
                <div className={styles.menuHeader}>
                  <strong>{user?.name} {user?.surname}</strong>
                  <span>{user?.email}</span>
                  <small>{isAdmin ? "Administrator" : "Guest account"}</small>
                </div>

                {isAdmin ? (
                  <>
                    <button role="menuitem" onClick={() => goTo("/admin-dashboard")}>
                      Admin dashboard
                    </button>
                    <button role="menuitem" onClick={() => goTo("/admin/accommodations")}>
                      Manage accommodations
                    </button>
                    <button role="menuitem" onClick={() => goTo("/admin/rooms")}>
                      Manage rooms
                    </button>
                    <button role="menuitem" onClick={() => goTo("/admin/bookings")}>
                      Manage bookings
                    </button>
                    <button role="menuitem" onClick={() => goTo("/admin/users")}>
                      Manage users
                    </button>
                  </>
                ) : (
                  <>
                    <button role="menuitem" onClick={() => goTo("/profile")}>
                      My profile
                    </button>
                    <button role="menuitem" onClick={() => goTo("/my-bookings")}>
                      My bookings
                    </button>
                  </>
                )}

                <button
                  role="menuitem"
                  className={styles.logout}
                  onClick={logout}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}