const postgres = require('postgres');

async function cleanupStatuses() {
  const sql = postgres(process.env.DATABASE_URL);
  const batchId = '955ba95e-656f-4dca-a118-969d4adb7084';

  try {
    console.log('🧹 Cleaning up duplicate statuses...');

    // Get all statuses for this batch, grouped by label
    const statuses = await sql`
      SELECT id, label, "order", color
      FROM queue_statuses
      WHERE batch_id = ${batchId}
      ORDER BY label, created_at
    `;

    console.log(`Found ${statuses.length} statuses for batch ${batchId}`);

    // Group by label and keep only the first one (oldest)
    const toDelete = [];
    const seen = new Set();

    for (const status of statuses) {
      if (seen.has(status.label)) {
        toDelete.push(status.id);
        console.log(`  Marked for deletion: ${status.label} (ID: ${status.id})`);
      } else {
        seen.add(status.label);
        console.log(`  Keeping: ${status.label} (ID: ${status.id})`);
      }
    }

    if (toDelete.length > 0) {
      console.log(`\n🗑️ Deleting ${toDelete.length} duplicate statuses...`);

      // Delete duplicates one by one
      for (const id of toDelete) {
        await sql`DELETE FROM queue_statuses WHERE id = ${id}`;
      }

      console.log('✅ Deleted all duplicate statuses');
    } else {
      console.log('✅ No duplicate statuses found');
    }

    // Verify result
    const remaining = await sql`
      SELECT COUNT(*) as count FROM queue_statuses WHERE batch_id = ${batchId}
    `;

    console.log(`\n📊 Remaining statuses: ${remaining[0].count}`);

    await sql.end();
  } catch (error) {
    console.error('❌ Failed:', error.message);
    await sql.end();
    process.exit(1);
  }
}

cleanupStatuses();
