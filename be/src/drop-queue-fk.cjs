const postgres = require('postgres');

async function dropAllFKs() {
  const sql = postgres(process.env.DATABASE_URL);

  try {
    console.log('🔧 Dropping all foreign key constraints...');

    try {
      await sql`ALTER TABLE queue_items DROP CONSTRAINT IF EXISTS queues_status_id_queue_statuses_id_fk`;
      console.log('  Dropped queues_status_id_queue_statuses_id_fk');
    } catch (e) {
      console.log('  Constraint queues_status_id_queue_statuses_id_fk not found, skipping');
    }

    console.log('✅ Foreign key constraints dropped');

    await sql.end();
  } catch (error) {
    console.error('❌ Failed:', error.message);
    await sql.end();
    process.exit(1);
  }
}

dropAllFKs();
