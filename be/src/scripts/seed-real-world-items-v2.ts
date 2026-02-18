import { db } from '../db/index.js';
import { queueItems, queueBatches, queueStatuses, queues } from '../db/schema.js';
import { v7 as uuidv7 } from 'uuid';
import { eq, sql } from 'drizzle-orm';

async function seedRealWorldItems() {
  console.log('🌱 Seeding real-world queue items...\n');

  // Get all active batches with their queues
  const batchesData = await db
    .select({
      batchId: queueBatches.id,
      batchName: queueBatches.name,
      queueId: queueBatches.queueId,
      queueName: queues.name,
    })
    .from(queueBatches)
    .innerJoin(queues, eq(queueBatches.queueId, queues.id))
    .where(eq(queueBatches.status, 'active'));

  // Get statuses for each batch
  const batchStatuses = new Map();

  for (const batch of batchesData) {
    const statuses = await db
      .select()
      .from(queueStatuses)
      .where(eq(queueStatuses.queueId, batch.batchId))
      .orderBy(queueStatuses.order);

    batchStatuses.set(batch.batchId, statuses);
    console.log(`  Found ${statuses.length} statuses for ${batch.batchName}`);
  }

  // Sample queue items for each batch
  const sampleItems = [
    // Restaurant A - Main Floor
    {
      batchName: 'Restaurant A - Main Floor - Batch 2026-02-17',
      items: [
        { queueNumber: 'R001', name: 'Budi Santoso', partySize: 4, phone: '081234567890' },
        { queueNumber: 'R002', name: 'Siti Rahayu', partySize: 2, phone: '081234567891', table: 'A1' },
        { queueNumber: 'R003', name: 'Ahmad Wijaya', partySize: 6, phone: '081234567892', table: 'B1' },
      ]
    },
    // RS Harapan - Emergency
    {
      batchName: 'RS Harapan - Emergency - Batch 2026-02-17',
      items: [
        { queueNumber: 'E001', name: 'John Doe', age: 45, symptoms: 'Chest pain', priority: 'high' },
        { queueNumber: 'E002', name: 'Jane Smith', age: 32, symptoms: 'Fever', priority: 'medium' },
        { queueNumber: 'E003', name: 'Michael Brown', age: 58, symptoms: 'Head injury', priority: 'critical' },
      ]
    },
    // BCA Branch Jakarta - Teller
    {
      batchName: 'BCA Branch Jakarta - Teller - Batch 2026-02-17',
      items: [
        { queueNumber: 'B001', name: 'Hendra Wijaya', service: 'Withdrawal', amount: 5000000 },
        { queueNumber: 'B002', name: 'Maya Sari', service: 'Deposit', amount: 10000000 },
        { queueNumber: 'B003', name: 'Rizky Pratama', service: 'Transfer', amount: 2500000 },
      ]
    },
    // Customer Support - Priority
    {
      batchName: 'Customer Support - Priority - Batch 2026-02-17',
      items: [
        { queueNumber: 'CS001', name: 'Bambang Sutrisno', issue: 'Account access', priority: 'high' },
        { queueNumber: 'CS002', name: 'Rina Kusuma', issue: 'Payment failed', priority: 'high', agent: 'Agent A' },
      ]
    },
    // Tech Conference 2026 - Check-in
    {
      batchName: 'Tech Conference 2026 - Check-in - Batch 2026-02-17',
      items: [
        { queueNumber: 'T001', name: 'Elon Musk', ticketType: 'VIP', company: 'Tesla' },
        { queueNumber: 'T002', name: 'Mark Zuckerberg', ticketType: 'Regular', company: 'Meta' },
        { queueNumber: 'T003', name: 'Satya Nadella', ticketType: 'VIP', company: 'Microsoft' },
      ]
    },
  ];

  const allItems = [];

  for (const sampleData of sampleItems) {
    const batch = batchesData.find(b => b.batchName === sampleData.batchName);

    if (!batch) {
      console.log(`⚠️  Batch not found: ${sampleData.batchName}`);
      continue;
    }

    const statuses = batchStatuses.get(batch.batchId);

    if (!statuses || statuses.length === 0) {
      console.log(`⚠️  No statuses found for batch: ${batch.batchName}`);
      continue;
    }

    console.log(`\n  📝 Adding items to: ${batch.batchName}`);

    for (let i = 0; i < sampleData.items.length; i++) {
      const itemData = sampleData.items[i];
      const statusIndex = i % statuses.length;

      allItems.push({
        id: uuidv7(),
        queueId: batch.queueId,
        batchId: batch.batchId,
        queueNumber: itemData.queueNumber,
        name: itemData.name,
        statusId: statuses[statusIndex].id,
        metadata: itemData,
      });

      console.log(`    ✓ ${itemData.queueNumber}: ${itemData.name}`);
    }
  }

  console.log(`\n  💾 Inserting ${allItems.length} items into database...`);

  await db.insert(queueItems).values(allItems);

  console.log(`\n✅ Seeded ${allItems.length} real-world queue items!`);
}

seedRealWorldItems().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
