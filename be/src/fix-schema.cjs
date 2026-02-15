const postgres = require('postgres');

async function fixSchema() {
  const sql = postgres(process.env.DATABASE_URL);

  try {
    console.log('🔧 Checking and fixing database schema...');

    // Add created_at and updated_at columns to queue_statuses if they don't exist
    const addColumns = await sql`
      ALTER TABLE queue_statuses
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()
    `;

    console.log('✅ Successfully added timestamp columns to queue_statuses');

    await sql.end();
  } catch (error) {
    console.error('❌ Failed to fix schema:', error.message);
    await sql.end();
    process.exit(1);
  }
}

fixSchema();
