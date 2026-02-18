import { db } from '../db/index.js';
import { queueItems, queues, queueBatches, queueStatuses } from '../db/schema.js';
import { v7 as uuidv7 } from 'uuid';
import { eq } from 'drizzle-orm';

async function seedRealWorldItems() {
  console.log('🌱 Seeding real-world queue items...\n');

  // Get all active batches
  const batches = await db
    .select()
    .from(queueBatches)
    .where(eq(queueBatches.status, 'active'));

  // Get statuses for each batch
  const batchStatuses = new Map();

  for (const batch of batches) {
    const statuses = await db
      .select()
      .from(queueStatuses)
      .where(eq(queueStatuses.queueId, batch.id))
      .orderBy(queueStatuses.order);

    batchStatuses.set(batch.id, statuses);
  }

  // Sample queue items for each batch
  const sampleData = [
    // Restaurant A - Main Floor
    { batchName: 'Restaurant A - Main Floor', items: [
      { queueNumber: 'R001', name: 'Budi Santoso', partySize: 4, phone: '081234567890', table: null },
      { queueNumber: 'R002', name: 'Siti Rahayu', partySize: 2, phone: '081234567891', table: 'A1' },
      { queueNumber: 'R003', name: 'Ahmad Wijaya', partySize: 6, phone: '081234567892', table: 'B1' },
      { queueNumber: 'R004', name: 'Dewi Lestari', partySize: 3, phone: '081234567893', table: 'A2' },
    ]},
    // Restaurant B - Outdoor
    { batchName: 'Restaurant B - Outdoor', items: [
      { queueNumber: 'R001', name: 'Rina Sari', partySize: 2, phone: '081234567894', table: null },
      { queueNumber: 'R002', name: 'Dedi Kurniawan', partySize: 4, phone: '081234567895', table: null },
    ]},
    // RS Harapan - Emergency
    { batchName: 'RS Harapan - Emergency', items: [
      { queueNumber: 'E001', name: 'John Doe', age: 45, symptoms: 'Chest pain', priority: 'high' },
      { queueNumber: 'E002', name: 'Jane Smith', age: 32, symptoms: 'Fever', priority: 'medium' },
      { queueNumber: 'E003', name: 'Michael Brown', age: 58, symptoms: 'Head injury', priority: 'critical' },
    ]},
    // Apotek Sehat - Main
    { batchName: 'Apotek Sehat - Main', items: [
      { queueNumber: 'P001', name: 'Siti Aminah', prescriptionId: 'RX-001' },
      { queueNumber: 'P002', name: 'Rudi Hermawan', prescriptionId: 'RX-002' },
      { queueNumber: 'P003', name: 'Maya Putri', prescriptionId: 'RX-003' },
    ]},
    // Customer Support - Priority
    { batchName: 'Customer Support - Priority', items: [
      { queueNumber: 'CS001', name: 'Bambang Sutrisno', issue: 'Account access', priority: 'high' },
      { queueNumber: 'CS002', name: 'Rina Kusuma', issue: 'Payment failed', priority: 'high', agent: 'Agent A' },
      { queueNumber: 'CS003', name: 'Doni Pratama', issue: 'Refund request', priority: 'medium', agent: 'Agent B' },
    ]},
    // Customer Support - Regular
    { batchName: 'Customer Support - Regular', items: [
      { queueNumber: 'CS001', name: 'Eko Prasetyo', issue: 'General inquiry', priority: 'low' },
      { queueNumber: 'CS002', name: 'Fani Rahmawati', issue: 'Feature request', priority: 'low' },
    ]},
    // BCA Branch Jakarta - Teller
    { batchName: 'BCA Branch Jakarta - Teller', items: [
      { queueNumber: 'B001', name: 'Hendra Wijaya', service: 'Withdrawal', amount: 5000000 },
      { queueNumber: 'B002', name: 'Maya Sari', service: 'Deposit', amount: 10000000 },
      { queueNumber: 'B003', name: 'Rizky Pratama', service: 'Transfer', amount: 2500000 },
    ]},
    // Kecamatan Tebet - Layanan KTP
    { batchName: 'Kecamatan Tebet - Layanan KTP', items: [
      { queueNumber: 'K001', name: 'Agus Setiawan', service: 'KTP Baru', nik: '320101xxxxxxxxxx' },
      { queueNumber: 'K002', name: 'Siti Nurhaliza', service: 'Perpanjangan KTP', nik: '320102xxxxxxxxxx' },
      { queueNumber: 'K003', name: 'Dedi Kurniawan', service: 'KTP Baru', nik: '320103xxxxxxxxxx' },
    ]},
    // Kantor Imigrasi - Paspor
    { batchName: 'Kantor Imigrasi - Paspor', items: [
      { queueNumber: 'P001', name: 'Gunawan Wijaya', service: 'Paspor Baru', nik: '320104xxxxxxxxxx' },
      { queueNumber: 'P002', name: 'Indah Lestari', service: 'Perpanjangan Paspor', nik: '320105xxxxxxxxxx' },
    ]},
    // SMA Negeri 1 - PPDB 2026
    { batchName: 'SMA Negeri 1 - PPDB 2026', items: [
      { queueNumber: 'S001', name: 'Andi Pratama', nisn: '1234567890', major: 'IPA' },
      { queueNumber: 'S002', name: 'Bunga Citra', nisn: '0987654321', major: 'IPS' },
      { queueNumber: 'S003', name: 'Cahyo Aji', nisn: '1122334455', major: 'IPA' },
    ]},
    // Tech Conference 2026 - Check-in
    { batchName: 'Tech Conference 2026 - Check-in', items: [
      { queueNumber: 'T001', name: 'Elon Musk', ticketType: 'VIP', company: 'Tesla' },
      { queueNumber: 'T002', name: 'Mark Zuckerberg', ticketType: 'Regular', company: 'Meta' },
      { queueNumber: 'T003', name: 'Satya Nadella', ticketType: 'VIP', company: 'Microsoft' },
    ]},
  ];

  const allItems = [];
  let itemCount = 0;

  for (const data of sampleData) {
    const batch = batches.find(b => b.name === data.batchName);
    if (!batch) {
      console.log(`⚠️  Batch not found: ${data.batchName}`);
      continue;
    }

    const statuses = batchStatuses.get(batch.id);
    if (!statuses || statuses.length === 0) {
      console.log(`⚠️  No statuses found for batch: ${data.batchName}`);
      continue;
    }

    const firstStatus = statuses[0].id;

    for (let i = 0; i < data.items.length; i++) {
      const itemData = data.items[i];
      const statusIndex = i % statuses.length;

      allItems.push({
        id: uuidv7(),
        queueId: batch.queueId,
        batchId: batch.id,
        queueNumber: itemData.queueNumber,
        name: itemData.name,
        statusId: statuses[statusIndex].id,
        metadata: itemData,
      });
      itemCount++;
    }

    console.log(`✅ Added ${data.items.length} items to ${data.batchName}`);
  }

  await db.insert(queueItems).values(allItems);
  console.log(`\n🎉 Seeded ${itemCount} real-world queue items!`);
}

seedRealWorldItems().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
