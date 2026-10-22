import { Pool, QueryResult, QueryResultRow } from "pg";
import dotenv from "dotenv";

dotenv.config();

const requiredEnvironmentVariables = [
  "DB_USER",
  "DB_HOST",
  "DB_DATABASE",
  "DB_PASSWORD",
];

for (const variable of requiredEnvironmentVariables) {
  if (!process.env[variable]) {
    throw new Error(`Missing required environment variable: ${variable}`);
  }
}

export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT || 5432),
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}

export async function DBConnection(): Promise<void> {
  try {
    const client = await pool.connect();
    console.log("PostgreSQL connected successfully.");
    client.release();
  } catch (error) {
    console.error("Unable to connect to PostgreSQL:", error);
    throw error;
  }
}