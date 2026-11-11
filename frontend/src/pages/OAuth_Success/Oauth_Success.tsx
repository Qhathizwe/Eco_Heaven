import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useAppDispatch } from "../../hooks/hooks";
import { restoreSession } from "../../redux/features/loginSlice";

import styles from "./OAuth_Success.module.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:7000/api";

export default function OAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [message, setMessage] = useState("Completing your sign-in...");

  useEffect(() => {
    let active = true;

    const completeLogin = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setMessage("We could not find your Google sign-in token.");
        return;
      }

      // Remove the token from the visible URL as soon as possible.
      window.history.replaceState(
        {},
        document.title,
        "/oauth-success"
      );

      try {
        const response = await fetch(`${API_URL}/account/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok || !data.user) {
          throw new Error(
            data.message || "Could not retrieve your account."
          );
        }

        // Save the same session structure used by normal login.
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Restore the Redux authentication state.
        await dispatch(restoreSession());

        if (!active) return;

        setMessage("Welcome to WildHaven! Redirecting...");

        navigate(
          data.user.role === "admin" ? "/admin-dashboard" : "/home",
          { replace: true }
        );
      } catch (error) {
        console.error("Google OAuth completion error:", error);

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        if (active) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Google sign-in could not be completed."
          );
        }
      }
    };

    completeLogin();

    return () => {
      active = false;
    };
  }, [searchParams, dispatch, navigate]);

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.logo}>W</div>

        <p className={styles.eyebrow}>WILDHAVEN · YOUR ESCAPE BEGINS HERE</p>

        <h1>Welcome to WildHaven</h1>

        <p className={styles.message}>{message}</p>

        <div className={styles.loader} />

        <p className={styles.note}>
          Please wait while we securely prepare your account.
        </p>
      </section>
    </main>
  );
}