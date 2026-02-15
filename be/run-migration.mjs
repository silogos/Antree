import postgres from 'postgres';
import { readFileSync } from 'fs';

const sql = readFileSync('./migration_add_queues.sql', 'utf-8');

const connectionString = process.env.DATABASE_URL || 'postgres://antree_user:antree_password@localhost:5432/antree_db';

const client = postgres(connectionString);

try {
  console.log('Running migration...');
  await client.unsafe(sql);
  console.log('Migration completed successfully!');
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
} finally {
  await client.end();
}
