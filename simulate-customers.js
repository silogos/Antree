#!/usr/bin/env node

/**
 * Simulate 10 customers using HTTP requests to the queue system
 * This script simulates customers:
 * 1. Joining the queue (creating queue items)
 * 2. Checking their queue status
 * 3. Being served (status updates)
 */

const API_BASE = process.env.API_URL || 'http://localhost:3001';

// Customer data for simulation
const customers = [
  { name: 'Budi Santoso', email: 'budi@email.com', phone: '081234567890' },
  { name: 'Siti Aminah', email: 'siti@email.com', phone: '081234567891' },
  { name: 'Ahmad Wijaya', email: 'ahmad@email.com', phone: '081234567892' },
  { name: 'Dewi Lestari', email: 'dewi@email.com', phone: '081234567893' },
  { name: 'Rudi Hartono', email: 'rudi@email.com', phone: '081234567894' },
  { name: 'Maya Sari', email: 'maya@email.com', phone: '081234567895' },
  { name: 'Joko Anwar', email: 'joko@email.com', phone: '081234567896' },
  { name: 'Rina Kurnia', email: 'rina@email.com', phone: '081234567897' },
  { name: 'Deni Prasetyo', email: 'deni@email.com', phone: '081234567898' },
  { name: 'Linda Permata', email: 'linda@email.com', phone: '081234567899' },
];

/**
 * Helper function to delay execution
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Helper function to make HTTP requests
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();
  return { status: response.status, data };
}

/**
 * Step 1: Check for existing or create a batch for simulation
 */
async function setupSimulationEnvironment() {
  console.log('🔍 Setting up simulation environment...');

  // Try to get existing batches
  const { status, data } = await apiRequest('/batches');
  let batchId;
  let statusId;

  if (status === 200 && data.data && data.data.length > 0) {
    // Use first active batch
    batchId = data.data[0].id;
    const templateId = data.data[0].templateId;
    console.log(`✓ Using existing batch: ${data.data[0].name} (${batchId})`);
    console.log(`✓ Template ID: ${templateId}`);

    // Get statuses for this batch
    const statuses = await apiRequest(`/statuses?batchId=${batchId}`);
    if (statuses.status === 200 && statuses.data.data && statuses.data.data.length > 0) {
      statusId = statuses.data.data[0].id;
      console.log(`✓ Using initial status: ${statuses.data.data[0].label} (${statusId})`);
    }

    return { batchId, templateId, statusId };
  }

  if (!batchId) {
    console.log('⚠ No active batch found. Please create a batch first:');
    console.log('  1. Create a template: POST /templates');
    console.log('  2. Create template statuses: POST /template-statuses');
    console.log('  3. Create a batch: POST /batches');
    console.log('\nOr use the seed script: pnpm db:seed');
    return null;
  }

  return { batchId, statusId };
}

/**
 * Step 2: Get existing queues to simulate
 */
async function getExistingQueues() {
  console.log('\n📋 Getting existing queues to simulate...\n');

  const { status, data } = await apiRequest('/queues');
  if (status !== 200 || !data.data || data.data.length === 0) {
    console.log('✗ No queues found. Please create some queues first.');
    return [];
  }

  console.log(`✓ Found ${data.data.length} existing queues`);

  // Filter for queues that have batchId (new system)
  const batchQueues = data.data.filter(q => q.batchId);
  console.log(`✓ Found ${batchQueues.length} queues with batchId (new system)`);

  // Get first 10 batch-based queues
  const queuesToSimulate = batchQueues.slice(0, 10);

  if (queuesToSimulate.length === 0) {
    console.log('⚠ No batch-based queues found. Will use all queues.');
    // Fallback to all queues
    const fallbackQueues = data.data.slice(0, 10);
    return fallbackQueues.map((queue, index) => ({
      ...queue,
      customer: customers[index] || { name: queue.name, email: 'unknown@email.com', phone: '0000000000' },
    }));
  }

  // Add customer data to each queue
  return queuesToSimulate.map((queue, index) => ({
    ...queue,
    customer: customers[index] || { name: queue.name, email: 'unknown@email.com', phone: '0000000000' },
  }));
}

/**
 * Step 3: Simulate customers checking their queue status
 */
async function simulateCustomersCheckingStatus(queues) {
  console.log('\n🔍 Simulating customers checking their queue status...\n');

  for (let i = 0; i < queues.length; i++) {
    const queue = queues[i];
    const queueNumber = queue.queueNumber;

    console.log(`[${i + 1}/10] ${queue.customer.name} checking status for ${queueNumber}...`);

    const { status, data } = await apiRequest(`/queues/${queue.id}`);

    if (status === 200) {
      console.log(`  ✓ Status: ${data.data.statusId} | Position: ${i + 1}`);
    } else {
      console.log(`  ✗ Failed: ${data.message}`);
    }

    // Delay between checks (random 200-800ms)
    await delay(200 + Math.random() * 600);
  }
}

/**
 * Step 4: Simulate serving customers (random order)
 */
async function simulateServingCustomers(queues) {
  console.log('\n🎯 Simulating serving customers...\n');

  // Get all statuses for the batch to find the "completed" status
  const batchId = queues[0]?.batchId;
  if (!batchId) {
    console.log('⚠ No batch ID found in queues. These queues use the old board-based system.');
    console.log('⚠ Skipping serving simulation as we need batch-based statuses.');
    return;
  }

  const { data: statuses } = await apiRequest(`/statuses?batchId=${batchId}`);
  if (!statuses || !statuses.data || statuses.data.length === 0) {
    console.log('⚠ No statuses found for this batch. Skipping serving simulation.');
    return;
  }

  const completedStatus = statuses.data.find(s =>
    s.label.toLowerCase().includes('completed') ||
    s.label.toLowerCase().includes('done')
  );

  if (!completedStatus) {
    console.log('⚠ No "completed" or "done" status found. Skipping serving simulation.');
    console.log('  Available statuses:', statuses.data.map(s => s.label).join(', '));
    return;
  }

  console.log(`✓ Using completed status: ${completedStatus.label}`);

  // Serve 3 random customers that have batchId
  const batchQueues = queues.filter(q => q.batchId);
  const customersToServe = [...batchQueues].sort(() => Math.random() - 0.5).slice(0, 3);

  for (let i = 0; i < customersToServe.length; i++) {
    const queue = customersToServe[i];

    console.log(`[${i + 1}/3] Serving ${queue.customer.name} (${queue.queueNumber})...`);

    const { status, data } = await apiRequest(`/queues/${queue.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        statusId: completedStatus.id,
        metadata: {
          ...queue.metadata,
          servedBy: 'Agent Smith',
          servedAt: new Date().toISOString(),
        },
      }),
    });

    if (status === 200) {
      console.log(`  ✓ Status updated to: ${completedStatus.label}`);
    } else {
      console.log(`  ✗ Failed: ${data.message}`);
    }

    // Delay between serving (1-3 seconds)
    await delay(1000 + Math.random() * 2000);
  }
}

/**
 * Step 5: Display final queue state
 */
async function displayFinalQueueState(batchId) {
  console.log('\n📊 Final Queue State\n');

  const { status, data } = await apiRequest(`/queues?batchId=${batchId}`);

  if (status === 200) {
    console.log('Active Queue Items:');
    data.data.forEach((queue, index) => {
      console.log(`  ${index + 1}. ${queue.queueNumber} - ${queue.name} [${queue.statusId}]`);
    });
    console.log(`\nTotal: ${data.data.length} queue items`);
  }
}

/**
 * Main simulation function
 */
async function runSimulation() {
  console.log('========================================');
  console.log('  Queue System Customer Simulation');
  console.log('  API: ' + API_BASE);
  console.log('========================================\n');

  try {
    // Step 1: Setup environment
    const env = await setupSimulationEnvironment();
    if (!env) {
      process.exit(1);
    }

    // Step 2: Get existing queues
    const queues = await getExistingQueues();

    if (queues.length === 0) {
      console.log('\n❌ No queues found to simulate. Exiting.');
      process.exit(1);
    }

    // Step 3: Customers check status
    await simulateCustomersCheckingStatus(queues);

    // Step 4: Serve some customers
    await simulateServingCustomers(queues);

    // Step 5: Display final state
    await displayFinalQueueState(env.batchId);

    console.log('\n✅ Simulation completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Simulation failed:', error.message);
    process.exit(1);
  }
}

// Run the simulation
runSimulation();
