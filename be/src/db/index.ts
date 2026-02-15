import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || 'postgres://antree_user:antree_password@localhost:5432/antree_db';

// Singleton pattern for database connection
let client: postgres.Sql | null = null;
let db: ReturnType<typeof drizzle> | null = null;

export function getDb(): ReturnType<typeof drizzle> {
  if (!client) {
    client = postgres(connectionString);
    db = drizzle(client);
  }
  return db!;
}

export function getClient(): postgres.Sql {
  if (!client) {
    client = postgres(connectionString);
  }
  return client!;
}

// Cleanup function for graceful shutdown
export async function closeDb() {
  if (client) {
    await client.end();
    client = null;
    db = null;
  }
}
