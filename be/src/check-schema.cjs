const postgres = require('postgres');

async function checkSchema() {
  const sql = postgres(process.env.DATABASE_URL);

  try {
    console.log('🔍 Checking queue_statuses table structure...');

    const result = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'queue_statuses'
      ORDER BY ordinal_position
    `;

    console.log('\nColumns in queue_statuses table:');
    console.log('=====================================');
    result.forEach(col => {
      console.log(`${col.column_name}: ${col.data_type}`);
    });

    await sql.end();
  } catch (error) {
    console.error('❌ Failed to check schema:', error.message);
    await sql.end();
    process.exit(1);
  }
}

checkSchema();
