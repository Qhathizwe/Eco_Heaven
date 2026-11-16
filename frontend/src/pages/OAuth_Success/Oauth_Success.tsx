import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { useAppDispatch } from "../../hooks/hooks";
import { handleGoogleOAuthLogin } from "../../redux/features/loginSlice";

import styles from "./OAuth_Success.module.css";

export default function OAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [message, setMessage] = useState(
    "Completing your secure sign-in...",
  );
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;

    const completeLogin = async () => {
      const token = searchParams.get("token");
      const error = searchParams.get("error");

      if (error) {
        setFailed(true);
        setMessage("Google sign-in could not be completed.");
        return;
      }

      if (!token) {
        setFailed(true);
        setMessage("No authentication token was received.");
        return;
      }

      window.history.replaceState(
        {},
        document.title,
        "/oauth-success",
      );

      try {
        const result = await dispatch(
          handleGoogleOAuthLogin(token),
        ).unwrap();

        if (!active) return;

        setMessage("Welcome! Preparing your account...");

        navigate(
          result.user.role === "admin"
            ? "/admin-dashboard"
            : "/home",
          { replace: true },
        );
      } catch (error) {
        console.error("Google sign-in completion failed:", error);

        if (!active) return;

        setFailed(true);
        setMessage(
          typeof error === "string"
            ? error
            : "We could not finish signing you in. Please try again.",
        );
      }
    };

    void completeLogin();

    return () => {
      active = false;
    };
  }, [dispatch, navigate, searchParams]);

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.logo}>W</div>

        <p className={styles.eyebrow}>WILDHAVEN · YOUR ESCAPE BEGINS HERE</p>

        <h1>
          {failed ? "Sign-in unsuccessful" : "Welcome to WildHaven"}
        </h1>

        <p className={styles.message}>{message}</p>

        {!failed && <div className={styles.loader} />}

        {failed && (
          <Link to="/login" className={styles.retryButton}>
            Return to sign in
          </Link>
        )}

        <p className={styles.note}>
          Your account information is handled securely.
        </p>
      </section>
    </main>
  );
}