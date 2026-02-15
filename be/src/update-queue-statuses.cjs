const postgres = require('postgres');

async function updateQueueStatuses() {
  const sql = postgres(process.env.DATABASE_URL);
  const batchId = '955ba95e-656f-4dca-a118-969d4adb7084';

  try {
    console.log('🔄 Updating queue status references...');

    // Get correct status IDs
    const statuses = await sql`
      SELECT id, label FROM queue_statuses WHERE batch_id = ${batchId}
    `;

    const statusMap = {};
    for (const s of statuses) {
      statusMap[s.label] = s.id;
    }

    console.log('Status map:', statusMap);

    // Update all queues to point to correct statuses
    const waitingId = statusMap['Waiting'];
    const servingId = statusMap['Serving'];
    const completedId = statusMap['Completed'];

    // First, update all queues with statusId that matches the deleted status IDs
    const deletedStatusIds = [
      '6546a276-c85d-4211-9bb7-95eeeb8a8061', // Waiting (deleted)
      'b96eee45-f2d5-4cf3-8f80-c64aed332be3', // Waiting (deleted)
      '1313c5b4-5e31-445b-9677-dba9632b1e85', // Waiting (deleted)
      '7374eb75-3191-472c-8065-a12c726c2a0a', // Serving (deleted)
    ];

    console.log(`Updating queues with deleted status IDs...`);
    for (const oldId of deletedStatusIds) {
      const result = await sql`
        UPDATE queue_items
        SET status_id = ${waitingId}
        WHERE status_id = ${oldId}
        RETURNING *
      `;
      console.log(`  Updated ${result.length} queues from ${oldId.substring(0, 8)}... to ${waitingId.substring(0, 8)}...`);
    }

    // Verify result
    const queueDistribution = await sql`
      SELECT status_id, COUNT(*) as count
      FROM queue_items
      WHERE batch_id = ${batchId}
      GROUP BY status_id
      ORDER BY status_id
    `;

    console.log('\n📊 Queue distribution:');
    for (const row of queueDistribution) {
      const status = statuses.find(s => s.id === row.status_id);
      const label = status ? status.label : 'Unknown';
      console.log(`  ${label}: ${row.count} queues`);
    }

    await sql.end();
  } catch (error) {
    console.error('❌ Failed:', error.message);
    console.error(error);
    await sql.end();
    process.exit(1);
  }
}

updateQueueStatuses();
