import { getDb } from '../db/index.js';
import { queueBatches, queueTemplates, queueTemplateStatuses, queueStatuses, queueItems, queues } from '../db/schema.js';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  const db = getDb();

  console.log('🌱 Seeding initial data...');

  // Seed system templates
  const templates = [
    {
      id: 'template-medical',
      name: 'Medical Services',
      description: 'Template for medical service queues',
      isSystemTemplate: true,
    },
    {
      id: 'template-banking',
      name: 'Banking Services',
      description: 'Template for banking service queues',
      isSystemTemplate: true,
    },
    {
      id: 'template-admin',
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
      id: uuidv4(),
      templateId: 'template-medical',
      label: 'Waiting',
      color: '#F59E0B',
      order: 1,
    },
    {
      id: uuidv4(),
      templateId: 'template-medical',
      label: 'In Progress',
      color: '#3B82F6',
      order: 2,
    },
    {
      id: uuidv4(),
      templateId: 'template-medical',
      label: 'Done',
      color: '#10B981',
      order: 3,
    },
  ];

  const bankingTemplateStatuses = [
    {
      id: uuidv4(),
      templateId: 'template-banking',
      label: 'Waiting',
      color: '#F59E0B',
      order: 1,
    },
    {
      id: uuidv4(),
      templateId: 'template-banking',
      label: 'Serving',
      color: '#3B82F6',
      order: 2,
    },
    {
      id: uuidv4(),
      templateId: 'template-banking',
      label: 'Completed',
      color: '#10B981',
      order: 3,
    },
  ];

  const adminTemplateStatuses = [
    {
      id: uuidv4(),
      templateId: 'template-admin',
      label: 'Pending',
      color: '#F59E0B',
      order: 1,
    },
    {
      id: uuidv4(),
      templateId: 'template-admin',
      label: 'Processing',
      color: '#3B82F6',
      order: 2,
    },
    {
      id: uuidv4(),
      templateId: 'template-admin',
      label: 'Approved',
      color: '#10B981',
      order: 3,
    },
    {
      id: uuidv4(),
      templateId: 'template-admin',
      label: 'Rejected',
      color: '#EF4444',
      order: 4,
    },
  ];

  await db.insert(queueTemplateStatuses).values([...medicalTemplateStatuses, ...bankingTemplateStatuses, ...adminTemplateStatuses]);
  console.log('✅ Seeded template statuses:', medicalTemplateStatuses.length + bankingTemplateStatuses.length + adminTemplateStatuses.length);

  // Create queues from templates
  const sampleQueues = [
    {
      id: 'queue-medical',
      name: 'Medical Customer Service',
      templateId: 'template-medical',
      isActive: true,
    },
    {
      id: 'queue-banking',
      name: 'Banking Counter',
      templateId: 'template-banking',
      isActive: true,
    },
    {
      id: 'queue-admin',
      name: 'Administrative Desk',
      templateId: 'template-admin',
      isActive: true,
    },
  ];

  await db.insert(queues).values(sampleQueues);
  console.log('✅ Seeded queues:', sampleQueues.length);

  // Create batches from queues
  const batches = [
    {
      id: 'batch-medical-2026',
      queueId: 'queue-medical',
      name: 'Medical Batch - 2026',
      status: 'active',
    },
    {
      id: 'batch-banking-2026',
      queueId: 'queue-banking',
      name: 'Banking Batch - 2026',
      status: 'active',
    },
    {
      id: 'batch-admin-2026',
      queueId: 'queue-admin',
      name: 'Admin Batch - 2026',
      status: 'active',
    },
  ];

  await db.insert(queueBatches).values(batches);
  console.log('✅ Seeded queue batches:', batches.length);

  // Create batch statuses (copied from template statuses)
  const medicalQueueStatuses = medicalTemplateStatuses.map(ts => ({
    id: uuidv4(),
    queueId: 'batch-medical-2026',
    templateStatusId: ts.id,
    label: ts.label,
    color: ts.color,
    order: ts.order,
  }));

  const bankingQueueStatuses = bankingTemplateStatuses.map(ts => ({
    id: uuidv4(),
    queueId: 'batch-banking-2026',
    templateStatusId: ts.id,
    label: ts.label,
    color: ts.color,
    order: ts.order,
  }));

  const adminQueueStatuses = adminTemplateStatuses.map(ts => ({
    id: uuidv4(),
    queueId: 'batch-admin-2026',
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
      id: uuidv4(),
      queueId: 'batch-medical-2026',
      queueNumber: 'A001',
      name: 'John Doe',
      statusId: medicalWaitingStatus?.id || '',
    },
    {
      id: uuidv4(),
      queueId: 'batch-medical-2026',
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
