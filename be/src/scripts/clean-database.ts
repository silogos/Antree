import { db } from '../db/index.js';
import { queueItems, queueStatuses, queueBatches, queues, queueTemplateStatuses, queueTemplates, queueBoards } from '../db/schema.js';

async function cleanDatabase() {
  console.log('🧹 Cleaning up database...\n');

  // Delete in reverse order of foreign key dependencies
  const tables = [
    { name: 'Queue Items', table: queueItems },
    { name: 'Queue Statuses', table: queueStatuses },
    { name: 'Queue Batches', table: queueBatches },
    { name: 'Queues', table: queues },
    { name: 'Queue Template Statuses', table: queueTemplateStatuses },
    { name: 'Queue Templates', table: queueTemplates },
    { name: 'Queue Boards', table: queueBoards },
  ];

  for (const { name, table } of tables) {
    try {
      const result = await db.delete(table);
      console.log(`✅ Deleted ${name}`);
    } catch (error) {
      console.error(`❌ Failed to delete ${name}:`, error);
    }
  }

  console.log('\n🎉 Database cleanup complete!');
}

cleanDatabase().catch((error) => {
  console.error('❌ Cleanup failed:', error);
  process.exit(1);
});
