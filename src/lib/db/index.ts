import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Database Connection — PostgreSQL via postgres.js
 *
 * Uses DATABASE_URL from environment.
 * Connection is lazy — only created when first query runs.
 */

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Add it to .env.local:\n" +
    "DATABASE_URL=postgresql://postgres:quiz123@localhost:5432/quizplatform",
  );
}

// Create postgres.js connection (connection pool)
const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

// Create Drizzle ORM instance with schema
export const db = drizzle(client, { schema });

// Re-export schema for convenience
export { schema };
export type Database = typeof db;
