import { db } from '../db/index.js';
import { queueItems } from '../db/schema.js';
import { v7 as uuidv7 } from 'uuid';

async function seedSampleItems() {
  console.log('🌱 Seeding sample queue items for real-world queues...\n');

  const sampleItems = [
    // Restaurant A - Main Floor
    { id: uuidv7(), queueId: '2fa074f4-f3a1-41b1-81bb-05b49a264ddb', batchId: 'e2a04125-d714-40fd-94f4-534c55f9a687', queueNumber: 'R001', name: 'Budi Santoso', statusId: 'waiting-status-1', metadata: { partySize: 4, phone: '081234567890' } },
    { id: uuidv7(), queueId: '2fa074f4-f3a1-41b1-81bb-05b49a264ddb', batchId: 'e2a04125-d714-40fd-94f4-534c55f9a687', queueNumber: 'R002', name: 'Siti Rahayu', statusId: 'seated-status-2', metadata: { partySize: 2, table: 'A1' } },
    { id: uuidv7(), queueId: '2fa074f4-f3a1-41b1-81bb-05b49a264ddb', batchId: 'e2a04125-d714-40fd-94f4-534c55f9a687', queueNumber: 'R003', name: 'Ahmad Wijaya', statusId: 'ordering-status-3', metadata: { partySize: 6, table: 'B1' } },
    { id: uuidv7(), queueId: '2fa074f4-f3a1-41b1-81bb-05b49a264ddb', batchId: 'e2a04125-d714-40fd-94f4-534c55f9a687', queueNumber: 'R004', name: 'Dewi Lestari', statusId: 'eating-status-4', metadata: { partySize: 3, table: 'A2' } },

    // RS Harapan - Emergency
    { id: uuidv7(), queueId: 'de61b5a7-aa81-4751-b0e3-69439f7d6c5a', batchId: '8ba029cc-68fc-4ecf-89f4-8b39b670971d', queueNumber: 'E001', name: 'John Doe', statusId: 'reg-status-1', metadata: { age: 45, symptoms: 'Chest pain', priority: 'high' } },
    { id: uuidv7(), queueId: 'de61b5a7-aa81-4751-b0e3-69439f7d6c5a', batchId: '8ba029cc-68fc-4ecf-89f4-8b39b670971d', queueNumber: 'E002', name: 'Jane Smith', statusId: 'triage-status-2', metadata: { age: 32, symptoms: 'Fever', priority: 'medium' } },
    { id: uuidv7(), queueId: 'de61b5a7-aa81-4751-b0e3-69439f7d6c5a', batchId: '8ba029cc-68fc-4ecf-89f4-8b39b670971d', queueNumber: 'E003', name: 'Michael Brown', statusId: 'waiting-status-3', metadata: { age: 58, symptoms: 'Head injury', priority: 'critical' } },

    // Apotek Sehat - Main
    { id: uuidv7(), queueId: '4143885e-3ef3-47f5-8519-80a5196f1e94', batchId: 'dc990c2b-af7c-4731-8059-d1a132153f86', queueNumber: 'P001', name: 'Siti Aminah', statusId: 'waiting-status-1', metadata: { prescriptionId: 'RX-001' } },
    { id: uuidv7(), queueId: '4143885e-3ef3-47f5-8519-80a5196f1e94', batchId: 'dc990c2b-af7c-4731-8059-d1a132153f86', queueNumber: 'P002', name: 'Rudi Hermawan', statusId: 'review-status-2', metadata: { prescriptionId: 'RX-002' } },
    { id: uuidv7(), queueId: '4143885e-3ef3-47f5-8519-80a5196f1e94', batchId: 'dc990c2b-af7c-4731-8059-d1a132153f86', queueNumber: 'P003', name: 'Maya Putri', statusId: 'preparing-status-3', metadata: { prescriptionId: 'RX-003' } },

    // Customer Support - Priority
    { id: uuidv7(), queueId: '3b29c034-9c31-4a27-a1d5-dc0732c72898', batchId: '21948d6e-dc13-43f7-bc98-406379e90ccf', queueNumber: 'CS001', name: 'Bambang Sutrisno', statusId: 'waiting-status-1', metadata: { issue: 'Account access', priority: 'high' } },
    { id: uuidv7(), queueId: '3b29c034-9c31-4a27-a1d5-dc0732c72898', batchId: '21948d6e-dc13-43f7-bc98-406379e90ccf', queueNumber: 'CS002', name: 'Rina Kusuma', statusId: 'assigned-status-2', metadata: { issue: 'Payment failed', priority: 'high', agent: 'Agent A' } },
    { id: uuidv7(), queueId: '3b29c034-9c31-4a27-a1d5-dc0732c72898', batchId: '21948d6e-dc13-43f7-bc98-406379e90ccf', queueNumber: 'CS003', name: 'Doni Pratama', statusId: 'progress-status-3', metadata: { issue: 'Refund request', priority: 'medium', agent: 'Agent B' } },

    // BCA Branch Jakarta - Teller
    { id: uuidv7(), queueId: 'c2f0d021-8ff7-477c-b3c3-4a05bc9f9151', batchId: 'f4bd118e-8964-437e-ac71-c007f525e330', queueNumber: 'B001', name: 'Hendra Wijaya', statusId: 'waiting-status-1', metadata: { service: 'Withdrawal', amount: 5000000 } },
    { id: uuidv7(), queueId: 'c2f0d021-8ff7-477c-b3c3-4a05bc9f9151', batchId: 'f4bd118e-8964-437e-ac71-c007f525e330', queueNumber: 'B002', name: 'Maya Sari', statusId: 'called-status-2', metadata: { service: 'Deposit', amount: 10000000 } },
    { id: uuidv7(), queueId: 'c2f0d021-8ff7-477c-b3c3-4a05bc9f9151', batchId: 'f4bd118e-8964-437e-ac71-c007f525e330', queueNumber: 'B003', name: 'Rizky Pratama', statusId: 'service-status-3', metadata: { service: 'Transfer', amount: 2500000 } },

    // Kecamatan Tebet - Layanan KTP
    { id: uuidv7(), queueId: 'bffa682a-2865-4dae-83ef-919e68ddf8f6', batchId: 'e983d37d-50ac-4c35-8d89-80a3316576b9', queueNumber: 'K001', name: 'Agus Setiawan', statusId: 'waiting-status-1', metadata: { service: 'KTP Baru', nik: '320101xxxxxxxxxx' } },
    { id: uuidv7(), queueId: 'bffa682a-2865-4dae-83ef-919e68ddf8f6', batchId: 'e983d37d-50ac-4c35-8d89-80a3316576b9', queueNumber: 'K002', name: 'Siti Nurhaliza', statusId: 'review-status-2', metadata: { service: 'Perpanjangan KTP', nik: '320102xxxxxxxxxx' } },
    { id: uuidv7(), queueId: 'bffa682a-2865-4dae-83ef-919e68ddf8f6', batchId: 'e983d37d-50ac-4c35-8d89-80a3316576b9', queueNumber: 'K003', name: 'Dedi Kurniawan', statusId: 'processing-status-3', metadata: { service: 'KTP Baru', nik: '320103xxxxxxxxxx' } },

    // SMA Negeri 1 - PPDB 2026
    { id: uuidv7(), queueId: 'd3f1b765-4cec-4a60-b751-42a66e8aeb97', batchId: 'd3f1b765-4cec-4a60-b751-42a66e8aeb97', queueNumber: 'S001', name: 'Andi Pratama', statusId: 'waiting-status-1', metadata: { nisn: '1234567890', major: 'IPA' } },
    { id: uuidv7(), queueId: 'd3f1b765-4cec-4a60-b751-42a66e8aeb97', batchId: 'd3f1b765-4cec-4a60-b751-42a66e8aeb97', queueNumber: 'S002', name: 'Bunga Citra', statusId: 'document-check-status-2', metadata: { nisn: '0987654321', major: 'IPS' } },
    { id: uuidv7(), queueId: 'd3f1b765-4cec-4a60-b751-42a66e8aeb97', batchId: 'd3f1b765-4cec-4a60-b751-42a66e8aeb97', queueNumber: 'S003', name: 'Cahyo Aji', statusId: 'interview-status-3', metadata: { nisn: '1122334455', major: 'IPA' } },

    // Tech Conference 2026 - Check-in
    { id: uuidv7(), queueId: '743adc1f-9894-4d75-817f-26916c67534f', batchId: '743adc1f-9894-4d75-817f-26916c67534f', queueNumber: 'T001', name: 'Elon Musk', statusId: 'waiting-status-1', metadata: { ticketType: 'VIP', company: 'Tesla' } },
    { id: uuidv7(), queueId: '743adc1f-9894-4d75-817f-26916c67534f', batchId: '743adc1f-9894-4d75-817f-26916c67534f', queueNumber: 'T002', name: 'Mark Zuckerberg', statusId: 'checking-in-status-2', metadata: { ticketType: 'Regular', company: 'Meta' } },
    { id: uuidv7(), queueId: '743adc1f-9894-4d75-817f-26916c67534f', batchId: '743adc1f-9894-4d75-817f-26916c67534f', queueNumber: 'T003', name: 'Satya Nadella', statusId: 'checked-in-status-3', metadata: { ticketType: 'VIP', company: 'Microsoft' } },
  ];

  // Get actual status IDs from database for each queue
  const { queueStatuses } = await import('../db/schema.js');
  const { eq, and } = await import('drizzle-orm');

  // Map status names to IDs for each batch
  const statusMap = new Map();

  for (const item of sampleItems) {
    if (!statusMap.has(item.batchId)) {
      const statuses = await db
        .select()
        .from(queueStatuses)
        .where(eq(queueStatuses.queueId, item.batchId))
        .orderBy(queueStatuses.order);

      const map: Record<string, string> = {};
      statuses.forEach(s => {
        const label = s.label.toLowerCase().replace(/\s+/g, '-');
        map[`${label}-status-${s.order}`] = s.id;
      });
      statusMap.set(item.batchId, map);
    }

    const map = statusMap.get(item.batchId);
    item.statusId = map[item.statusId] || map[Object.keys(map)[0]];
  }

  await db.insert(queueItems).values(sampleItems);
  console.log(`✅ Seeded ${sampleItems.length} sample queue items\n`);

  // Show summary
  const batchGroups = new Map();
  sampleItems.forEach(item => {
    if (!batchGroups.has(item.batchId)) {
      batchGroups.set(item.batchId, []);
    }
    batchGroups.get(item.batchId).push(item);
  });

  console.log('📊 Queue Items Summary:\n');
  for (const [batchId, items] of batchGroups) {
    const queueName = items[0].name.split(' ').slice(0, 2).join(' ') + '...';
    console.log(`  ${queueName}: ${items.length} items`);
  }

  console.log('\n🎉 Sample queue items seeded successfully!');
}

seedSampleItems().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
