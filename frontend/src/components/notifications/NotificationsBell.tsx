import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../../hooks/hooks";

import {
  fetchNotificationsThunk,
  markAllNotificationsReadThunk,
  markNotificationReadThunk,
} from "../../redux/features/notificationSlice";

import styles from "./NotificationBell.module.css";

export default function NotificationBell() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { items, unreadCount, isLoading } = useAppSelector(
    (state) => state.notifications,
  );

  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void dispatch(fetchNotificationsThunk());

    const refresh = () => {
      if (document.visibilityState === "visible") {
        void dispatch(fetchNotificationsThunk());
      }
    };

    window.addEventListener("focus", refresh);

    return () => {
      window.removeEventListener("focus", refresh);
    };
  }, [dispatch]);

  useEffect(() => {
    function closeOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOutside);

    return () => {
      document.removeEventListener("mousedown", closeOutside);
    };
  }, []);

  async function openNotification(
    id: number,
    link: string | null,
    isRead: boolean,
  ) {
    if (!isRead) {
      await dispatch(markNotificationReadThunk(id));
    }

    setOpen(false);

    if (link) {
      navigate(link);
    }
  }

  async function markAllRead() {
    await dispatch(markAllNotificationsReadThunk());
  }

  return (
    <div className={styles.wrapper} ref={panelRef}>
      <button
        type="button"
        className={styles.bellButton}
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {unreadCount > 0 && (
          <span className={styles.badge}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <section className={styles.panel}>
          <header className={styles.panelHeader}>
            <div>
              <h2>Notifications</h2>
              <p>
                {unreadCount === 0
                  ? "You're all caught up."
                  : `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`}
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                className={styles.markAll}
                onClick={() => void markAllRead()}
              >
                Mark all read
              </button>
            )}
          </header>

          <div className={styles.notificationList}>
            {isLoading && items.length === 0 && (
              <p className={styles.empty}>Loading notifications...</p>
            )}

            {!isLoading && items.length === 0 && (
              <div className={styles.emptyState}>
                <span>♧</span>
                <strong>No notifications yet</strong>
                <p>
                  Booking updates and important account messages will appear
                  here.
                </p>
              </div>
            )}

            {items.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`${styles.notification} ${
                  !item.is_read ? styles.unread : ""
                }`}
                onClick={() =>
                  void openNotification(
                    item.id,
                    item.link,
                    item.is_read,
                  )
                }
              >
                <span className={styles.notificationIcon}>
                  {item.type === "booking" ? "⌂" : "•"}
                </span>

                <span className={styles.notificationContent}>
                  <strong>{item.title}</strong>
                  <span>{item.message}</span>
                  <small>
                    {new Date(item.created_at).toLocaleString()}
                  </small>
                </span>

                {!item.is_read && (
                  <span className={styles.unreadDot} />
                )}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}