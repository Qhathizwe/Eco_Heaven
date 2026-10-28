import { query } from "../config/database";
import type { CreateBookingInput } from "../types/app.types";

export async function createBookingTable(): Promise<void> {
  await query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'booking_status'
      ) THEN
        CREATE TYPE booking_status AS ENUM (
          'pending', 'confirmed', 'cancelled', 'completed'
        );
      END IF;
    END
    $$;
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      accommodation_id INTEGER NOT NULL
        REFERENCES accomodations(id) ON DELETE CASCADE,
      room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      check_in DATE NOT NULL,
      check_out DATE NOT NULL,
      guests INTEGER NOT NULL DEFAULT 1 CHECK (guests > 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      status booking_status NOT NULL DEFAULT 'pending',
      CHECK (check_out > check_in)
    );
  `);

  await query(`
    ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS guests INTEGER NOT NULL DEFAULT 1;
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS bookings_room_dates_idx
    ON bookings (room_id, check_in, check_out);
  `);

  console.log("Bookings table checked/created.");
}

export async function createBooking(data: CreateBookingInput) {
  const roomResult = await query<{
    id: number;
    accommodation_id: number;
    is_available: boolean;
  }>(
    `
      SELECT id, accommodation_id, is_available
      FROM rooms
      WHERE id = $1 AND accommodation_id = $2
    `,
    [data.room_id, data.accommodation_id],
  );

  const room = roomResult.rows[0];

  if (!room || !room.is_available) {
    return null;
  }

  const conflictResult = await query(
    `
      SELECT id
      FROM bookings
      WHERE room_id = $1
        AND status IN ('pending', 'confirmed')
        AND check_in < $3::date
        AND check_out > $2::date
      LIMIT 1
    `,
    [data.room_id, data.check_in, data.check_out],
  );

  if (conflictResult.rows.length > 0) {
    return null;
  }

  const result = await query(
    `
      INSERT INTO bookings
        (user_id, accommodation_id, room_id, check_in,
         check_out, guests, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING *
    `,
    [
      data.user_id,
      data.accommodation_id,
      data.room_id,
      data.check_in,
      data.check_out,
      data.guests,
    ],
  );

  return result.rows[0];
}

export async function getBookingsByUser(userId: number) {
  const result = await query(
    `
      SELECT
        b.id,
        b.user_id,
        b.accommodation_id,
        b.room_id,
        b.check_in,
        b.check_out,
        b.guests,
        b.status,
        b.created_at,
        a.name AS accommodation_name,
        a.address AS accommodation_address,
        a.pictures AS accommodation_pictures,
        r.room_type,
        r.price_per_night
      FROM bookings b
      JOIN accomodations a ON a.id = b.accommodation_id
      JOIN rooms r ON r.id = b.room_id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `,
    [userId],
  );

  return result.rows;
};


export const getAllBookings = async () => {
  const result = await query(`
    SELECT
      b.id,
      b.user_id,
      b.accommodation_id,
      b.room_id,
      b.check_in,
      b.check_out,
      b.guests,
      b.status,
      b.created_at,
      a.name AS accommodation_name,
      a.address AS accommodation_address,
      r.room_type,
      r.price_per_night,
      u.name AS customer_name,
      u.email AS customer_email
    FROM bookings b
    INNER JOIN users u ON u.id = b.user_id
    INNER JOIN accomodations a ON a.id = b.accommodation_id
    INNER JOIN rooms r ON r.id = b.room_id
    ORDER BY b.created_at DESC, b.id DESC
  `);

  return result.rows;
};

export const updateBookingStatus = async (
  bookingId: number,
  status: "pending" | "confirmed" | "cancelled" | "completed"
) => {
  const result = await query(
    `UPDATE bookings
     SET status = $1
     WHERE id = $2
     RETURNING *`,
    [status, bookingId]
  );

  return result.rows[0] ?? null;
};