import { query } from "../config/database";

export interface CreateNotificationInput {
  user_id: number;
  title: string;
  message: string;
  type: string;
  link?: string | null;
}

export async function createNotificationTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(180) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(40) NOT NULL DEFAULT 'general',
      link VARCHAR(500),
      is_read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS notifications_user_created_idx
    ON notifications (user_id, created_at DESC);
  `);

  console.log("Notifications table checked/created.");
}

export async function createNotification(
  data: CreateNotificationInput,
) {
  const result = await query(
    `
      INSERT INTO notifications
        (user_id, title, message, type, link)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
    [
      data.user_id,
      data.title,
      data.message,
      data.type,
      data.link ?? null,
    ],
  );

  return result.rows[0];
}

export async function getNotificationsByUser(userId: number) {
  const result = await query(
    `
      SELECT *
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 50
    `,
    [userId],
  );

  return result.rows;
}

export async function markNotificationAsRead(
  notificationId: number,
  userId: number,
) {
  const result = await query(
    `
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `,
    [notificationId, userId],
  );

  return result.rows[0] ?? null;
}

export async function markAllNotificationsAsRead(userId: number) {
  const result = await query(
    `
      UPDATE notifications
      SET is_read = TRUE
      WHERE user_id = $1 AND is_read = FALSE
      RETURNING id
    `,
    [userId],
  );

  return result.rowCount ?? 0;
}