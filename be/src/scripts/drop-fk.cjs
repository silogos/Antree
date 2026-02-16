const postgres = require('postgres');

async function dropForeignKey() {
  const sql = postgres(process.env.DATABASE_URL);

  try {
    console.log('🔧 Dropping foreign key constraints...');

    await sql`
      ALTER TABLE queue_statuses
      DROP CONSTRAINT IF EXISTS queue_statuses_board_id_queue_boards_id_fk
    `;

    await sql`
      ALTER TABLE queue_items
      DROP CONSTRAINT IF EXISTS queues_board_id_queue_boards_id_fk
    `;

    console.log('✅ Foreign key constraints dropped');

    await sql.end();
  } catch (error) {
    console.error('❌ Failed:', error.message);
    await sql.end();
    process.exit(1);
  }
}

dropForeignKey();
