import { query } from "../config/database";

export const createFavouriteTable = async (): Promise<void> => {
    await query(`
    CREATE TABLE IF NOT EXISTS accommodation_favourites (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL
      REFERENCES users(id) ON DELETE CASCADE,
      accommodation_id INTEGER NOT NULL
      REFERENCES accomodations(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, accommodation_id)
    )
  `);
    console.log("Favourite table checked/created.");
};

export const getFavouritesForUser = async (userId: number) => {
  const result = await query(
    `SELECT a.*, f.created_at AS favourited_at
     FROM accommodation_favourites f
     JOIN accomodations a ON a.id = f.accommodation_id
     WHERE f.user_id = $1
     ORDER BY f.created_at DESC`,
    [userId]
  );

  return result.rows;
};

export const getFavouriteIdsForUser = async (userId: number) => {
  const result = await query(
    `SELECT accommodation_id
     FROM accommodation_favourites
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );

  return result.rows.map((row) => Number(row.accommodation_id));
};

export const addFavourite = async (
  userId: number,
  accommodationId: number
) => {
  const accommodation = await query(
    "SELECT id FROM accomodations WHERE id = $1",
    [accommodationId]
  );

  if (accommodation.rows.length === 0) {
    throw new Error("Accommodation not found.");
  }

  const result = await query(
    `INSERT INTO accommodation_favourites
      (user_id, accommodation_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, accommodation_id) DO NOTHING
     RETURNING *`,
    [userId, accommodationId]
  );

  return result.rows[0] ?? {
    user_id: userId,
    accommodation_id: accommodationId,
  };
};

export const removeFavourite = async (
  userId: number,
  accommodationId: number
) => {
  const result = await query(
    `DELETE FROM accommodation_favourites
     WHERE user_id = $1 AND accommodation_id = $2
     RETURNING id`,
    [userId, accommodationId]
  );

  return result.rowCount !== 0;
};
