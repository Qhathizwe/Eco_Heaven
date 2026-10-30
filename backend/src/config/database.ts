import { Pool, QueryResult, QueryResultRow } from "pg";
import dotenv from "dotenv";
import net from "net"
import dns from "dns";

dotenv.config();

dns.setDefaultResultOrder("ipv4first");
net.setDefaultAutoSelectFamilyAttemptTimeout(5000);

const requiredEnvironmentVariables = [
  "DB_USER",
  "DB_HOST",
  "DB_DATABASE",
  "DB_PASSWORD",
  "DATABASE_URL"


];

for (const variable of requiredEnvironmentVariables) {
  if (!process.env[variable]) {
    throw new Error(`Missing required environment variable: ${variable}`);
  }
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 30000,
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