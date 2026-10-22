import { query } from "../config/database";
import type { Rooms } from "../types/app.types";

export async function createRoomsTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS rooms (
      id SERIAL PRIMARY KEY,
      accommodation_id INTEGER NOT NULL
        REFERENCES accomodations(id) ON DELETE CASCADE,
      room_type VARCHAR(100) NOT NULL,
      price_per_night NUMERIC(10,2) NOT NULL CHECK (price_per_night >= 0),
      description TEXT NOT NULL DEFAULT '',
      is_available BOOLEAN NOT NULL DEFAULT TRUE,
      pictures TEXT[] NOT NULL DEFAULT '{}'
    );
  `);

  console.log("Rooms table checked/created.");
}

export interface RoomInput {
  accommodation_id: number;
  room_type: string;
  price_per_night: number;
  description: string;
  is_available?: boolean;
  pictures?: string[];
}

export async function addRoomService(data: RoomInput): Promise<Rooms> {
  const result = await query<Rooms>(
    `
      INSERT INTO rooms
        (accommodation_id, room_type, price_per_night,
         description, is_available, pictures)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *
    `,
    [
      data.accommodation_id,
      data.room_type.trim(),
      data.price_per_night,
      data.description ?? "",
      data.is_available ?? true,
      data.pictures ?? [],
    ],
  );

  return result.rows[0];
}

export async function getAllRooms(): Promise<Rooms[]> {
  const result = await query<Rooms>(
    "SELECT * FROM rooms ORDER BY id DESC",
  );

  return result.rows;
}

export async function getRoomsByAccommodationService(
  accommodationId: number,
): Promise<Rooms[]> {
  const result = await query<Rooms>(
    `
      SELECT * FROM rooms
      WHERE accommodation_id = $1
      ORDER BY id DESC
    `,
    [accommodationId],
  );

  return result.rows;
}

export async function getRoomById(id: number): Promise<Rooms | null> {
  const result = await query<Rooms>(
    "SELECT * FROM rooms WHERE id = $1",
    [id],
  );

  return result.rows[0] ?? null;
}

export async function updateRoomService(
  id: number,
  data: Partial<RoomInput>,
): Promise<Rooms | null> {
  const existing = await getRoomById(id);
  if (!existing) return null;

  const result = await query<Rooms>(
    `
      UPDATE rooms
      SET accommodation_id = $1,
          room_type = $2,
          price_per_night = $3,
          description = $4,
          is_available = $5,
          pictures = $6
      WHERE id = $7
      RETURNING *
    `,
    [
      data.accommodation_id ?? existing.accommodation_id,
      data.room_type?.trim() ?? existing.room_type,
      data.price_per_night ?? existing.price_per_night,
      data.description ?? existing.description,
      data.is_available ?? existing.is_available,
      data.pictures ?? existing.pictures ?? [],
      id,
    ],
  );

  return result.rows[0] ?? null;
}

export async function deleteRoomService(id: number): Promise<boolean> {
  const result = await query(
    "DELETE FROM rooms WHERE id = $1",
    [id],
  );

  return (result.rowCount ?? 0) > 0;
}