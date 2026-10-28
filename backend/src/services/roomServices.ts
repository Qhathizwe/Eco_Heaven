
import { query } from "../config/database";
import { Rooms } from "../types/app.types";

export const createRoomsTable = async (): Promise<void> => {
  await query(`
    CREATE TABLE IF NOT EXISTS rooms (
      id SERIAL PRIMARY KEY,
      accommodation_id INT NOT NULL
        REFERENCES accomodations(id) ON DELETE CASCADE,
      room_type VARCHAR(100) NOT NULL,
      price_per_night NUMERIC(10, 2) NOT NULL
        CHECK (price_per_night > 0),
      description TEXT NOT NULL,
      is_available BOOLEAN NOT NULL DEFAULT TRUE,
      pictures TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]
    )
  `);

  // Ensure older tables receive the pictures column/default.
  await query(`
    ALTER TABLE rooms
    ADD COLUMN IF NOT EXISTS pictures TEXT[] NOT NULL
    DEFAULT ARRAY[]::TEXT[]
  `);

  console.log("Rooms table checked/created successfully.");
};

interface RoomInput {
  accommodation_id: number;
  room_type: string;
  price_per_night: number;
  description: string;
  is_available?: boolean;
  pictures?: string[];
}

export const addRoomService = async (
  roomData: RoomInput
): Promise<Rooms> => {
  const {
    accommodation_id,
    room_type,
    price_per_night,
    description,
    pictures = [],
    is_available = true,
  } = roomData;

  // Confirm the parent accommodation exists before inserting.
  const accommodation = await query(
    "SELECT id FROM accomodations WHERE id = $1",
    [accommodation_id]
  );

  if (accommodation.rows.length === 0) {
    throw new Error("The selected accommodation does not exist.");
  }

  const result = await query(
    `INSERT INTO rooms
      (accommodation_id, room_type, price_per_night, description, pictures, is_available)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      accommodation_id,
      room_type,
      price_per_night,
      description,
      pictures,
      is_available,
    ]
  );

  return result.rows[0] as Rooms;
};

export const getAllRooms = async (): Promise<Rooms[]> => {
  const result = await query(
    "SELECT * FROM rooms ORDER BY id DESC"
  );

  return result.rows as Rooms[];
};

export const getRoomsByAccommodationService = async (
  accommodationId: number | string
): Promise<Rooms[]> => {
  const result = await query(
    `SELECT * FROM rooms
     WHERE accommodation_id = $1
     ORDER BY id DESC`,
    [Number(accommodationId)]
  );

  return result.rows as Rooms[];
};

export const updateRoomService = async (
  id: number,
  updateData: Record<string, unknown>
): Promise<Rooms | null> => {
  const allowedFields: Record<string, string> = {
    room_type: "room_type",
    price_per_night: "price_per_night",
    description: "description",
    is_available: "is_available",
    pictures: "pictures",
  };

  const fields = Object.keys(updateData).filter(
    (field) => allowedFields[field] !== undefined
  );

  if (fields.length === 0) {
    const existing = await query(
      "SELECT * FROM rooms WHERE id = $1",
      [id]
    );

    return (existing.rows[0] as Rooms) ?? null;
  }

  const values: unknown[] = [];
  const assignments = fields.map((field, index) => {
    values.push(updateData[field]);
    return `${allowedFields[field]} = $${index + 1}`;
  });

  values.push(id);

  const result = await query(
    `UPDATE rooms
     SET ${assignments.join(", ")}
     WHERE id = $${values.length}
     RETURNING *`,
    values
  );

  return (result.rows[0] as Rooms) ?? null;
};

export const deleteRoomService = async (
  id: number
): Promise<boolean> => {
  const result = await query(
    "DELETE FROM rooms WHERE id = $1",
    [id]
  );

  return (result.rowCount ?? 0) > 0;
};

