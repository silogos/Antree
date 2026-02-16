const postgres = require('postgres');

async function setServing() {
  const sql = postgres(process.env.DATABASE_URL);
  const batchId = '955ba95e-656f-4dca-a118-969d4adb7084';
  const servingId = '6021a76d-d9d0-4b8f-b47a-8a39b91b5346';

  try {
    console.log('🔄 Setting Serving status for queues A010 and A014...');

    await sql`
      UPDATE queue_items
      SET status_id = ${servingId}
      WHERE batch_id = ${batchId} AND queue_number IN ('A010', 'A014')
    `;

    console.log('✅ Updated');

    // Verify
    const result = await sql`
      SELECT queue_number, name, status_id
      FROM queue_items
      WHERE batch_id = ${batchId} AND queue_number IN ('A010', 'A014')
    `;

    console.log('\n📊 Updated queues:');
    for (const row of result) {
      const status = row.status_id.substring(0, 8) + '...';
      console.log(`  ${row.queue_number}: ${row.name} → Status: ${status}`);
    }

    await sql.end();
  } catch (error) {
    console.error('❌ Failed:', error.message);
    await sql.end();
    process.exit(1);
  }
}

setServing();
