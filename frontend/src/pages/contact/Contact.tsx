import { useState, type FormEvent } from "react";
import Navbar from "../../components/navbar/Navbar";
import styles from "./Contact.module.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:7000/api";

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const initialForm: ContactForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export default function Contact() {
  const [form, setForm] = useState<ContactForm>(initialForm);
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  function updateField(
    field: keyof ContactForm,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSending(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to send your message.");
      }

      setSuccess(
        "Your message has been sent successfully. Thank you for contacting WildHeaven.",
      );
      setForm(initialForm);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "We could not send your message. Please try again.",
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.container}>
        <section className={styles.intro}>
          <span className={styles.eyebrow}>WE'RE HERE TO HELP</span>
          <h1>Let's start a conversation.</h1>
          <p>
            Have a question about a reservation, an accommodation or
            the platform? Send us a message and we'll get back to you.
          </p>
        </section>

        <div className={styles.layout}>
          <aside className={styles.infoCard}>
            <span className={styles.eyebrow}>GET IN TOUCH</span>
            <h2>How can we help?</h2>

            <p>
              Use the contact form to send a question or request.
              Include your booking reference if your message is about
              an existing reservation.
            </p>

            <div className={styles.infoItem}>
              <span>01</span>
              <div>
                <strong>Booking support</strong>
                <p>Questions about reservations and booking status.</p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <span>02</span>
              <div>
                <strong>Accommodation enquiries</strong>
                <p>Questions about rooms, facilities and availability.</p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <span>03</span>
              <div>
                <strong>General enquiries</strong>
                <p>Feedback and questions about WildHeaven.</p>
              </div>
            </div>
          </aside>

          <section className={styles.formCard}>
            <span className={styles.eyebrow}>SEND A MESSAGE</span>
            <h2>Contact our team</h2>

            {success && (
              <div className={styles.success} role="status">
                {success}
              </div>
            )}

            {error && (
              <div className={styles.error} role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <label>
                Your name
                <input
                  value={form.name}
                  onChange={(event) =>
                    updateField("name", event.target.value)
                  }
                  placeholder="Enter your name"
                  maxLength={100}
                  required
                />
              </label>

              <label>
                Email address
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    updateField("email", event.target.value)
                  }
                  placeholder="you@example.com"
                  maxLength={150}
                  required
                />
              </label>

              <label>
                Subject
                <input
                  value={form.subject}
                  onChange={(event) =>
                    updateField("subject", event.target.value)
                  }
                  placeholder="What is your message about?"
                  maxLength={150}
                  required
                />
              </label>

              <label>
                Your message
                <textarea
                  value={form.message}
                  onChange={(event) =>
                    updateField("message", event.target.value)
                  }
                  placeholder="Tell us how we can help..."
                  rows={6}
                  maxLength={3000}
                  required
                />
              </label>

              <button type="submit" disabled={isSending}>
                {isSending ? "Sending message..." : "Send message"}
                <span>→</span>
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}