import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Validate required environment variables
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL environment variable is not set. " +
      "Please set it in your .env file or environment."
  );
}

// Initialize database connection
const client = postgres(connectionString);
export const db = drizzle(client);

// Export client for raw queries if needed
export { client };

// Cleanup function for graceful shutdown
export async function closeDb() {
  await client.end();
}
