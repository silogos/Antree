import { db } from '../db/index.js';
import { queueBatches, queueTemplates, queueTemplateStatuses, queueStatuses, queueItems, queues } from '../db/schema.js';
import { v7 as uuidv7 } from 'uuid';

async function seed() {
  console.log('🌱 Seeding initial data...');

  // Seed system templates
  const medicalTemplateId = uuidv7();
  const bankingTemplateId = uuidv7();
  const adminTemplateId = uuidv7();

  const templates = [
    {
      id: medicalTemplateId,
      name: 'Medical Services',
      description: 'Template for medical service queues',
      isSystemTemplate: true,
    },
    {
      id: bankingTemplateId,
      name: 'Banking Services',
      description: 'Template for banking service queues',
      isSystemTemplate: true,
    },
    {
      id: adminTemplateId,
      name: 'Administrative Services',
      description: 'Template for administrative service queues',
      isSystemTemplate: true,
    },
  ];

  await db.insert(queueTemplates).values(templates);
  console.log('✅ Seeded queue templates:', templates.length);

  // Seed template statuses for medical template
  const medicalTemplateStatuses = [
    {
      id: uuidv7(),
      templateId: medicalTemplateId,
      label: 'Waiting',
      color: '#F59E0B',
      order: 1,
    },
    {
      id: uuidv7(),
      templateId: medicalTemplateId,
      label: 'In Progress',
      color: '#3B82F6',
      order: 2,
    },
    {
      id: uuidv7(),
      templateId: medicalTemplateId,
      label: 'Done',
      color: '#10B981',
      order: 3,
    },
  ];

  const bankingTemplateStatuses = [
    {
      id: uuidv7(),
      templateId: bankingTemplateId,
      label: 'Waiting',
      color: '#F59E0B',
      order: 1,
    },
    {
      id: uuidv7(),
      templateId: bankingTemplateId,
      label: 'Serving',
      color: '#3B82F6',
      order: 2,
    },
    {
      id: uuidv7(),
      templateId: bankingTemplateId,
      label: 'Completed',
      color: '#10B981',
      order: 3,
    },
  ];

  const adminTemplateStatuses = [
    {
      id: uuidv7(),
      templateId: adminTemplateId,
      label: 'Pending',
      color: '#F59E0B',
      order: 1,
    },
    {
      id: uuidv7(),
      templateId: adminTemplateId,
      label: 'Processing',
      color: '#3B82F6',
      order: 2,
    },
    {
      id: uuidv7(),
      templateId: adminTemplateId,
      label: 'Approved',
      color: '#10B981',
      order: 3,
    },
    {
      id: uuidv7(),
      templateId: adminTemplateId,
      label: 'Rejected',
      color: '#EF4444',
      order: 4,
    },
  ];

  await db.insert(queueTemplateStatuses).values([...medicalTemplateStatuses, ...bankingTemplateStatuses, ...adminTemplateStatuses]);
  console.log('✅ Seeded template statuses:', medicalTemplateStatuses.length + bankingTemplateStatuses.length + adminTemplateStatuses.length);

  // Create queues from templates
  const medicalQueueId = uuidv7();
  const bankingQueueId = uuidv7();
  const adminQueueId = uuidv7();

  const sampleQueues = [
    {
      id: medicalQueueId,
      name: 'Medical Customer Service',
      templateId: medicalTemplateId,
      isActive: true,
    },
    {
      id: bankingQueueId,
      name: 'Banking Counter',
      templateId: bankingTemplateId,
      isActive: true,
    },
    {
      id: adminQueueId,
      name: 'Administrative Desk',
      templateId: adminTemplateId,
      isActive: true,
    },
  ];

  await db.insert(queues).values(sampleQueues);
  console.log('✅ Seeded queues:', sampleQueues.length);

  // Create batches from queues
  const medicalBatchId = uuidv7();
  const bankingBatchId = uuidv7();
  const adminBatchId = uuidv7();

  const batches = [
    {
      id: medicalBatchId,
      templateId: medicalTemplateId,
      queueId: medicalQueueId,
      name: 'Medical Batch - 2026',
      status: 'active',
    },
    {
      id: bankingBatchId,
      templateId: bankingTemplateId,
      queueId: bankingQueueId,
      name: 'Banking Batch - 2026',
      status: 'active',
    },
    {
      id: adminBatchId,
      templateId: adminTemplateId,
      queueId: adminQueueId,
      name: 'Admin Batch - 2026',
      status: 'active',
    },
  ];

  await db.insert(queueBatches).values(batches);
  console.log('✅ Seeded queue batches:', batches.length);

  // Create batch statuses (copied from template statuses)
  const medicalQueueStatuses = medicalTemplateStatuses.map(ts => ({
    id: uuidv7(),
    queueId: medicalBatchId,
    templateStatusId: ts.id,
    label: ts.label,
    color: ts.color,
    order: ts.order,
  }));

  const bankingQueueStatuses = bankingTemplateStatuses.map(ts => ({
    id: uuidv7(),
    queueId: bankingBatchId,
    templateStatusId: ts.id,
    label: ts.label,
    color: ts.color,
    order: ts.order,
  }));

  const adminQueueStatuses = adminTemplateStatuses.map(ts => ({
    id: uuidv7(),
    queueId: adminBatchId,
    templateStatusId: ts.id,
    label: ts.label,
    color: ts.color,
    order: ts.order,
  }));

  await db.insert(queueStatuses).values([...medicalQueueStatuses, ...bankingQueueStatuses, ...adminQueueStatuses]);
  console.log('✅ Seeded batch statuses:', medicalQueueStatuses.length + bankingQueueStatuses.length + adminQueueStatuses.length);

  // Seed some sample queue items
  const medicalWaitingStatus = medicalQueueStatuses.find(s => s.label === 'Waiting');
  const medicalInProgressStatus = medicalQueueStatuses.find(s => s.label === 'In Progress');

  const sampleQueueItems = [
    {
      id: uuidv7(),
      queueId: medicalQueueId,
      batchId: medicalBatchId,
      queueNumber: 'A001',
      name: 'John Doe',
      statusId: medicalWaitingStatus?.id || '',
    },
    {
      id: uuidv7(),
      queueId: medicalQueueId,
      batchId: medicalBatchId,
      queueNumber: 'A002',
      name: 'Jane Smith',
      statusId: medicalInProgressStatus?.id || '',
    },
  ];

  await db.insert(queueItems).values(sampleQueueItems);
  console.log('✅ Seeded sample queue items:', sampleQueueItems.length);

  console.log('🎉 Seeding completed!');
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
