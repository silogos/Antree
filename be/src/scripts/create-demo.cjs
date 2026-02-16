const postgres = require('postgres');
const { v4: uuidv4 } = require('uuid');

async function createStatusesAndCustomers() {
  const sql = postgres(process.env.DATABASE_URL);

  try {
    const batchId = '955ba95e-656f-4dca-a118-969d4adb7084';
    const templateId = '0616f3a2-1868-424b-a7ee-8eec32dc11fe';

    console.log('📋 Creating statuses for batch...');

    // Create statuses with explicit timestamps
    const now = new Date().toISOString();

    const status1Id = uuidv4();
    const status2Id = uuidv4();
    const status3Id = uuidv4();

    await sql`
      INSERT INTO queue_statuses (id, batch_id, board_id, template_status_id, label, color, "order", created_at, updated_at)
      VALUES (
        ${status1Id}, ${batchId}, ${batchId}, ${'a4ef83e7-6d76-455b-971f-b8a1dad015d8'}, ${'Waiting'}, ${'#F59E0B'}, 1, ${now}, ${now}
      ),
      (
        ${status2Id}, ${batchId}, ${batchId}, ${'2728288c-0508-4da7-a046-db939625674d'}, ${'Serving'}, ${'#3B82F6'}, 2, ${now}, ${now}
      ),
      (
        ${status3Id}, ${batchId}, ${batchId}, ${'21c761d7-eade-41f2-a0a0-47c1b2b0256a'}, ${'Completed'}, ${'#10B981'}, 3, ${now}, ${now}
      )
    `;

    console.log('✅ Created 3 statuses:');
    console.log(`   1. Waiting (statusId: ${status1Id})`);
    console.log(`   2. Serving (statusId: ${status2Id})`);
    console.log(`   3. Completed (statusId: ${status3Id})`);

    console.log('\n👥 Creating 15 customers...');

    const customers = [
      { number: 'A001', name: 'Ahmad Fauzi', phone: '081234567890' },
      { number: 'A002', name: 'Budi Santoso', phone: '081234567891' },
      { number: 'A003', name: 'Citra Dewi', phone: '081234567892' },
      { number: 'A004', name: 'Dian Permata', phone: '081234567893' },
      { number: 'A005', name: 'Eko Prasetyo', phone: '081234567894' },
      { number: 'A006', name: 'Fani Rahmawati', phone: '081234567895' },
      { number: 'A007', name: 'Gunawan Wijaya', phone: '081234567896' },
      { number: 'A008', name: 'Hartono Susilo', phone: '081234567897' },
      { number: 'A009', name: 'Indah Lestari', phone: '081234567898' },
      { number: 'A010', name: 'Joko Widodo', phone: '081234567899' },
      { number: 'A011', name: 'Kartika Sari', phone: '081234567900' },
      { number: 'A012', name: 'Lukman Hakim', phone: '081234567901' },
      { number: 'A013', name: 'Mawar Putri', phone: '081234567902' },
      { number: 'A014', name: 'Nurul Hidayah', phone: '081234567903' },
      { number: 'A015', name: 'Oscar Fernando', phone: '081234567904' },
    ];

    for (const customer of customers) {
      const queueId = uuidv4();
      const metadata = JSON.stringify({
        customerName: customer.name,
        phone: customer.phone,
        estimatedDuration: '00:15:00',
      });

      // Randomly assign initial status (mostly "Waiting", a few "Serving")
      const isServing = Math.random() < 0.2; // 20% chance of being in "Serving"
      const statusId = isServing ? status2Id : status1Id;

      await sql`
        INSERT INTO queue_items (id, batch_id, board_id, template_id, queue_number, name, status_id, created_at, updated_at, metadata)
        VALUES (
          ${queueId}, ${batchId}, ${batchId}, ${templateId}, ${customer.number}, ${customer.name}, ${statusId}, ${now}, ${now}, ${metadata}::jsonb
        )
      `;

      console.log(`   ${customer.number}: ${customer.name} [${isServing ? 'Serving' : 'Waiting'}]`);
    }

    console.log(`\n✅ Successfully created batch: ${batchId}`);
    console.log(`   Template: ${templateId}`);
    console.log(`   Total customers: ${customers.length}`);
    console.log(`   Status: active`);

    await sql.end();
  } catch (error) {
    console.error('❌ Failed:', error.message);
    console.error(error);
    await sql.end();
    process.exit(1);
  }
}

createStatusesAndCustomers();
