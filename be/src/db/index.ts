import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || 'postgres://antree_user:antree_password@localhost:5432/antree_db';

// Initialize database connection
const client = postgres(connectionString);
export const db = drizzle(client);

// Export client for raw queries if needed
export { client };

// Cleanup function for graceful shutdown
export async function closeDb() {
  await client.end();
}
