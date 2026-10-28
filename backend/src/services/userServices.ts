import bcrypt from "bcryptjs";
import { query } from "../config/database";
import type {
  new_user,
  PublicUser,
  User,
  user_role,
} from "../types/app.types";

export async function createUserTable(): Promise<void> {
  await query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'user_role'
      ) THEN
        CREATE TYPE user_role AS ENUM ('admin', 'user');
      END IF;
    END
    $$;
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      surname VARCHAR(100) NOT NULL,
      email VARCHAR(200) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(30) NOT NULL,
      role user_role NOT NULL DEFAULT 'user',
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("Users table checked/created.");
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    surname: user.surname,
    email: user.email,
    phone: user.phone,
    role: user.role,
    created_at: user.created_at,
  };
}

export async function createUser(
  userData: new_user,
): Promise<PublicUser> {
  const passwordHash = await bcrypt.hash(userData.password, 12);

  const result = await query<User>(
    `
      INSERT INTO users
        (name, surname, email, password, phone, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, surname, email, password, phone, role, created_at
    `,
    [
      userData.name.trim(),
      userData.surname.trim(),
      userData.email.trim().toLowerCase(),
      passwordHash,
      userData.phone.trim(),
      userData.role,
    ],
  );

  return toPublicUser(result.rows[0]);
}

export async function findAllUsers(): Promise<PublicUser[]> {
  const result = await query<User>(`
    SELECT id, name, surname, email, password, phone, role, created_at
    FROM users
    ORDER BY id DESC
  `);

  return result.rows.map(toPublicUser);
}

export async function findUserById(id: number): Promise<User | null> {
  const result = await query<User>(
    "SELECT * FROM users WHERE id = $1",
    [id],
  );

  return result.rows[0] ?? null;
}

export async function findUserByEmail(
  email: string,
): Promise<User | null> {
  const result = await query<User>(
    "SELECT * FROM users WHERE email = $1",
    [email.trim().toLowerCase()],
  );

  return result.rows[0] ?? null;
}

export async function findUserByRole(
  role: user_role,
): Promise<PublicUser[]> {
  const result = await query<User>(
    `
      SELECT id, name, surname, email, password, phone, role, created_at
      FROM users
      WHERE role = $1
      ORDER BY id DESC
    `,
    [role],
  );

  return result.rows.map(toPublicUser);
}

export async function updateUser(
  id: number,
  input: Partial<{
    name: string;
    surname: string;
    email: string;
    password: string;
    phone: string;
    role: user_role;
  }>,
): Promise<PublicUser | null> {
  const existing = await findUserById(id);
  if (!existing) return null;

  const passwordHash = input.password
    ? await bcrypt.hash(input.password, 12)
    : existing.password;

  const result = await query<User>(
    `
      UPDATE users
      SET name = $1,
          surname = $2,
          email = $3,
          password = $4,
          phone = $5,
          role = $6
      WHERE id = $7
      RETURNING id, name, surname, email, password, phone, role, created_at
    `,
    [
      input.name?.trim() ?? existing.name,
      input.surname?.trim() ?? existing.surname,
      input.email?.trim().toLowerCase() ?? existing.email,
      passwordHash,
      input.phone?.trim() ?? existing.phone,
      input.role ?? existing.role,
      id,
    ],
  );

  const updated = result.rows[0];
  return updated ? toPublicUser(updated) : null;
}

export async function deleteUser(
  id: number,
): Promise<PublicUser | null> {
  const result = await query<User>(
    `
      DELETE FROM users
      WHERE id = $1
      RETURNING id, name, surname, email, password, phone, role, created_at
    `,
    [id],
  );

  const deleted = result.rows[0];
  return deleted ? toPublicUser(deleted) : null;
};

export async function updateOwnProfile(
  id: number,
  input: {
    name: string;
    surname: string;
    email: string;
    phone: string;
  },
): Promise<PublicUser | null> {
  const result = await query<User>(
    `
      UPDATE users
      SET name = $1,
          surname = $2,
          email = $3,
          phone = $4
      WHERE id = $5
      RETURNING id, name, surname, email, password, phone, role, created_at
    `,
    [
      input.name.trim(),
      input.surname.trim(),
      input.email.trim().toLowerCase(),
      input.phone.trim(),
      id,
    ],
  );

  const updated = result.rows[0];
  return updated ? toPublicUser(updated) : null;
}

export async function changeOwnPassword(
  id: number,
  currentPassword: string,
  newPassword: string,
): Promise<boolean> {
  const user = await findUserById(id);

  if (!user) {
    return false;
  }

  const passwordMatches = await bcrypt.compare(
    currentPassword,
    user.password,
  );

  if (!passwordMatches) {
    throw new Error("CURRENT_PASSWORD_INCORRECT");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  const result = await query(
    `
      UPDATE users
      SET password = $1
      WHERE id = $2
    `,
    [passwordHash, id],
  );

  return (result.rowCount ?? 0) > 0;
};

export async function getUserFavourites(id: number): Promise<any[]> {
  const result = await query(
    `
    SELECT a.*, f.created_at AS favourited_at
    FROM accommodation_favourites f
    JOIN accomodations a ON a.id = f.accommodation_id
    WHERE f.user_id = $1
    `,
    [id],
  );

  return result.rows;
}