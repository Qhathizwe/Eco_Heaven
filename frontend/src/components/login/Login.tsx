import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import {
  loginUserThunk,
  updateLoginField,
} from "../../redux/features/loginSlice";
import styles from "./Login.module.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:7000/api";

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { form, isLoading, error } = useAppSelector((state) => state.login);

  const handleGoogleLogin = () => {
    // Directly point the browser window to your backend endpoint
    window.location.href = `${API_URL}/auth/google`;
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = await dispatch(loginUserThunk(form));

    if (loginUserThunk.fulfilled.match(result)) {
      navigate(
        result.payload.user.role === "admin"
          ? "/admin-dashboard"
          : "/home",
        { replace: true },
      );
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <Link to="/" className={styles.brand}>WildHaven</Link>

        <p className={styles.eyebrow}>WELCOME BACK</p>
        <h1>Find your way back to <span>nature.</span></h1>
        <p className={styles.intro}>
          Sign in to manage your account and continue planning your next escape.
        </p>

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(event) =>
              dispatch(updateLoginField({
                field: "email",
                value: event.target.value,
              }))
            }
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={form.password}
            onChange={(event) =>
              dispatch(updateLoginField({
                field: "password",
                value: event.target.value,
              }))
            }
            required
          />

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Signing you in…" : "Sign in"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className={styles.googleBtn}
        >
          <svg
            className={styles.googleIcon}
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
              transform="translate(0 4)"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v9.02h12.94c-.58 2.96-2.26 5.47-4.73 7.16l7.64 5.92c4.46-4.12 7.13-10.2 7.13-17.55Z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a24 24 0 0 0 0 21.56l7.98-6.19Z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.64-5.92c-2.12 1.42-4.84 2.26-8.26 2.26-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
            />
          </svg>
          Continue with Google
        </button>

        <p className={styles.footerText}>
          New to WildHaven? <Link to="/register">Create an account</Link>
        </p>

        <Link to="/" className={styles.backLink}>← Back to home</Link>
      </section>
    </main>
  );
}
