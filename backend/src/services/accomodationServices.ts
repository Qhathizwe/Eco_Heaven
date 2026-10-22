import { query } from "../config/database";
import type {
  Accomodations,
  new_accomodation,
} from "../types/app.types";

export async function createAccomodationTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS accomodations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL,
      amenities TEXT[] NOT NULL DEFAULT '{}',
      star_rating NUMERIC(2,1) NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      pictures TEXT[] NOT NULL DEFAULT '{}',
      province VARCHAR(100) NOT NULL,
      rooms TEXT[] NOT NULL DEFAULT '{}'
    );
  `);

  console.log("Accommodations table checked/created.");
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed: unknown = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (item): item is string => typeof item === "string",
        );
      }
    } catch {
      return [value.trim()];
    }
  }

  return [];
}

export async function createAccomdation(
  data: new_accomodation,
): Promise<Accomodations> {
  const result = await query<Accomodations>(
    `
      INSERT INTO accomodations
        (name, description, address, amenities, star_rating,
         pictures, province, rooms)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
    `,
    [
      data.name.trim(),
      data.description ?? "",
      data.address.trim(),
      asStringArray(data.amenities),
      Number(data.star_rating),
      asStringArray(data.pictures),
      data.province.trim(),
      asStringArray(data.rooms),
    ],
  );

  return result.rows[0];
}

export async function findAllAccomodations(): Promise<Accomodations[]> {
  const result = await query<Accomodations>(
    "SELECT * FROM accomodations ORDER BY id DESC",
  );

  return result.rows;
}

export async function findAccomodationById(
  id: number,
): Promise<Accomodations | null> {
  const result = await query<Accomodations>(
    "SELECT * FROM accomodations WHERE id = $1",
    [id],
  );

  return result.rows[0] ?? null;
}

export async function findAccomodationByName(
  name: string,
): Promise<Accomodations[]> {
  const result = await query<Accomodations>(
    "SELECT * FROM accomodations WHERE name ILIKE $1 ORDER BY id DESC",
    [`%${name}%`],
  );

  return result.rows;
}

export async function findAccomodationByProvince(
  province: string,
): Promise<Accomodations[]> {
  const result = await query<Accomodations>(
    "SELECT * FROM accomodations WHERE province ILIKE $1 ORDER BY id DESC",
    [province],
  );

  return result.rows;
}

export async function updateAccomodation(
  id: number,
  data: Partial<new_accomodation>,
): Promise<Accomodations | null> {
  const existing = await findAccomodationById(id);
  if (!existing) return null;

  const result = await query<Accomodations>(
    `
      UPDATE accomodations
      SET name = $1,
          description = $2,
          address = $3,
          amenities = $4,
          star_rating = $5,
          pictures = $6,
          province = $7,
          rooms = $8,
          updated_at = NOW()
      WHERE id = $9
      RETURNING *
    `,
    [
      data.name?.trim() ?? existing.name,
      data.description ?? existing.description ?? "",
      data.address?.trim() ?? existing.address,
      asStringArray(data.amenities ?? existing.amenities),
      Number(data.star_rating ?? existing.star_rating),
      asStringArray(data.pictures ?? existing.pictures),
      data.province?.trim() ?? existing.province,
      asStringArray(data.rooms ?? existing.rooms),
      id,
    ],
  );

  return result.rows[0] ?? null;
}

export async function deleteAccomodation(
  id: number,
): Promise<Accomodations | null> {
  const result = await query<Accomodations>(
    "DELETE FROM accomodations WHERE id = $1 RETURNING *",
    [id],
  );

  return result.rows[0] ?? null;
}