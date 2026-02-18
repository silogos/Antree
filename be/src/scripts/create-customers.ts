import { db } from '../db/index.js';
import { queueBatches, queueItems } from '../db/schema.js';
import { v7 as uuidv7 } from 'uuid';

async function createCustomers() {
  const batchId = '955ba95e-656f-4dca-a118-969d4adb7084';
  const templateId = '0616f3a2-1868-424b-a7ee-8eec32dc11fe';

  // Get statuses for the batch
  // Note: This will fail if statuses table doesn't have timestamps
  // We'll manually insert without timestamps first

  const customers = [];
  const customerNames = [
    'Ahmad Fauzi', 'Budi Santoso', 'Citra Dewi', 'Dian Permata',
    'Eko Prasetyo', 'Fani Rahmawati', 'Gunawan Wijaya', 'Hartono Susilo',
    'Indah Lestari', 'Joko Widodo', 'Kartika Sari', 'Lukman Hakim',
    'Mawar Putri', 'Nurul Hidayah', 'Oscar Fernando'
  ];

  for (let i = 0; i < 15; i++) {
    customers.push({
      id: uuidv7(),
      batchId: batchId,
      templateId: templateId,
      queueNumber: `A${String(i + 1).padStart(3, '0')}`,
      name: customerNames[i],
      statusId: '',  // We'll set this after we have the status IDs
      metadata: {
        customerName: customerNames[i],
        estimatedDuration: '00:15:00',
      }
    });
  }

  console.log(`✅ Generated ${customers.length} customers for batch ${batchId}`);
  console.log('Customer list:');
  customers.forEach(c => {
    console.log(`  ${c.queueNumber}: ${c.name}`);
  });
}

createCustomers().catch((error) => {
  console.error('❌ Failed to create customers:', error);
  process.exit(1);
});
