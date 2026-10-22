import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import {
  loginUserThunk,
  updateLoginField,
} from "../../redux/features/loginSlice";
import styles from "./Login.module.css";

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { form, isLoading, error } = useAppSelector((state) => state.login);

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

        <p className={styles.footerText}>
          New to WildHaven? <Link to="/register">Create an account</Link>
        </p>

        <Link to="/" className={styles.backLink}>← Back to home</Link>
      </section>
    </main>
  );
}