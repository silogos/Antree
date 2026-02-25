#!/usr/bin/env node

/**
 * Simple Queue Simulation Script (Fixed for UUID v7)
 * Simulates queue operations with UUID v7 support
 */

import { fetchAPI } from "./http-client.js";

// API Configuration
const API_BASE_URL = process.env.API_URL || "http://localhost:3001";

/**
 * Get all queues
 */
async function getQueues() {
  const result = await fetchAPI("/queues");

  if (!result.ok || !result.data.success) {
    console.error("❌ Failed to get queues:", result.data.error || result.data.message);
    return [];
  }

  return result.data.data || [];
}

/**
 * Get statuses for a batch using API
 */
async function getBatchStatuses(batchId) {
  const result = await fetchAPI(`/batches/${batchId}/statuses`);

  if (!result.ok || !result.data.success) {
    console.error("❌ Failed to get batch statuses:", result.data.error || result.data.message);
    return [];
  }

  const statuses = result.data.data || [];
  console.log(`   Found ${statuses.length} statuses:\n`);
  statuses.forEach((status, index) => {
    console.log(`     ${index + 1}. ${status.label} (${status.id})`);
  });
  console.log("");

  return statuses;
}

/**
 * Get queue items for a specific queue or batch
 */
async function getQueueItems(queueId, batchId, statusId) {
  let endpoint = "/queue-items";
  const params = [];

  if (queueId) {
    params.push(`queueId=${queueId}`);
  }

  if (batchId) {
    params.push(`batchId=${batchId}`);
  }

  if (statusId) {
    params.push(`statusId=${statusId}`);
  }

  if (params.length > 0) {
    endpoint += `?${params.join("&")}`;
  }

  const result = await fetchAPI(endpoint);

  if (!result.ok || !result.data.success) {
    console.error("❌ Failed to get queue items:", result.data.error || result.data.message);
    return [];
  }

  return result.data.data || [];
}

/**
 * Create a queue item
 */
async function createQueueItem(queueId, batchId, queueNumber, name, statusId, metadata = {}) {
  const result = await fetchAPI("/queue-items", {
    method: "POST",
    body: JSON.stringify({
      queueId,
      batchId,
      queueNumber,
      name,
      statusId,
      metadata,
    }),
  });

  return result;
}

/**
 * Get queue by ID
 */
async function getQueueById(queueId) {
  const result = await fetchAPI(`/queues/${queueId}`);

  if (!result.ok || !result.data.success) {
    console.error("❌ Failed to get queue:", result.data.error || result.data.message);
    return null;
  }

  return result.data.data;
}

/**
 * Delay helper
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Main workflow simulation
 */
async function simulateWorkflow(queueId, customerCount = 10) {
  console.log("🎬 Starting Queue Workflow Simulation...");
  console.log(`   Queue ID: ${queueId}`);
  console.log(`   Customer Count: ${customerCount}\n`);

  // Step 1: Get queue info
  console.log("📍 Step 1: Getting queue information...");
  const queue = await getQueueById(queueId);

  if (!queue) {
    console.error("❌ Queue not found!");
    return;
  }

  console.log(`   Queue Name: ${queue.name}`);
  console.log(`   Active Batch: ${queue.activeBatchId || "None"}`);
  console.log(`   Active Batch Name: ${queue.activeBatch?.name || "None"}\n`);

  const activeBatch = queue.activeBatch;
  if (!activeBatch) {
    console.error("❌ No active batch found!");
    return;
  }

  // Step 2: Get statuses from the active batch
  console.log("📍 Step 2: Getting statuses...");
  const statuses = await getBatchStatuses(activeBatch.id);

  if (statuses.length === 0) {
    console.error("❌ No statuses found for this batch!");
    return;
  }

  console.log(`   Found ${statuses.length} statuses:\n`);
  statuses.forEach((status, index) => {
    console.log(`     ${index + 1}. ${status.label} (${status.id})`);
  });
  console.log("");

  // Step 3: Add customers to queue
  console.log("📍 Step 3: Adding customers to queue...");

  const customerNames = [
    "Budi Santoso",
    "Siti Rahayu",
    "Ahmad Wijaya",
    "Dewi Lestari",
    "Agus Setiawan",
    "Rina Melati",
    "Dedi Kurniawan",
    "Maya Putri",
    "Indra Pratama",
    "Sarah Amalia",
    "Eko Prasetyo",
    "Fani Rahmawati",
    "Gunawan Wijaya",
    "Hartono Susilo",
    "Lestari Ayu",
    "Rizky Firmansyah",
  ];

  const addedItems = [];
  const firstStatusId = statuses[0].id;
  const firstStatusLabel = statuses[0].label;

  for (let i = 0; i < customerCount; i++) {
    const customerName = customerNames[i % customerNames.length];
    const queueNumber = `A${String(i + 1).padStart(3, "0")}`;

    const metadata = {
      arrivalTime: new Date().toISOString(),
      customerType: "walk-in",
      serviceType: "general",
    };

    const result = await createQueueItem(
      queueId,
      activeBatch.id,
      queueNumber,
      customerName,
      firstStatusId,
      metadata
    );

    if (!result.ok || !result.data.success) {
      console.error(
        `   ❌ Failed to create ${queueNumber}:`,
        result.data.error || result.data.message
      );
      continue;
    }

    const item = result.data.data;
    addedItems.push(item);
    console.log(
      `   ✅ [${Math.round(((i + 1) / customerCount) * 100)}%] ${queueNumber} - ${customerName} [${firstStatusLabel}]`
    );

    // Small delay between additions
    if (i < customerCount - 1) {
      await delay(500);
    }
  }

  console.log(`\n✅ Added ${addedItems.length} customers to queue\n`);

  return addedItems;
}

/**
 * Command handler for workflow simulation
 */
async function runWorkflow(args) {
  const queueId = args[0];
  const customerCount = parseInt(args[1]) || 10;

  if (!queueId) {
    console.error("❌ Error: queueId is required");
    console.log("\nUsage: pnpm run simulate-simple workflow <queueId> [customerCount]");
    console.log(
      "Example: pnpm run simulate-simple workflow 019c6bd5-cbf2-7471-a6d8-bae2c09fd616 10"
    );
    process.exit(1);
  }

  await simulateWorkflow(queueId, customerCount);
  process.exit(0);
}

/**
 * Command handler for listing queues
 */
async function runList() {
  console.log("📋 Available Queues:\n");

  const queues = await getQueues();

  if (queues.length === 0) {
    console.log("No queues found.");
    process.exit(0);
  }

  queues.forEach((queue, index) => {
    console.log(`${index + 1}. ${queue.name}`);
    console.log(`   ID: ${queue.id}`);
    console.log(`   Template ID: ${queue.templateId}`);

    if (queue.activeBatchId) {
      console.log(`   Active Batch: ${queue.activeBatch.name} (${queue.activeBatchId})`);
    }

    console.log("");
  });

  process.exit(0);
}

/**
 * Main entry point
 */
async function main() {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  switch (command) {
    case "workflow":
      await runWorkflow(args);
      break;
    case "list":
      await runList();
      break;
    default:
      console.error(`❌ Unknown command: ${command}`);
      console.log("\nAvailable commands:");
      console.log("  list           - List all available queues");
      console.log("  workflow <id> [count]  - Simulate adding customers to queue");
      console.log("\nExamples:");
      console.log("  pnpm run simulate-simple list");
      console.log("  pnpm run simulate-simple workflow 019c6bd5-cbf2-7471-a6d8-bae2c09fd616 10");
      process.exit(1);
  }
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
