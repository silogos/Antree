import { getDb } from './db/index.js';
import { queueBoards, queueStatuses } from './db/schema.js';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  const db = getDb();

  console.log('🌱 Seeding initial data...');

  // Seed queue boards
  const boards = [
    {
      id: 'board-medical',
      name: 'Medical Services',
      description: 'Queue management for medical services',
    },
    {
      id: 'board-banking',
      name: 'Banking Services',
      description: 'Queue management for banking services',
    },
    {
      id: 'board-admin',
      name: 'Administrative Services',
      description: 'Queue management for administrative services',
    },
  ];

  await db.insert(queueBoards).values(boards);
  console.log('✅ Seeded queue boards:', boards.length);

  // Seed queue statuses for each board
  const medicalStatuses = [
    {
      id: uuidv4(),
      boardId: 'board-medical',
      label: 'Waiting',
      color: '#F59E0B',
      order: 1,
    },
    {
      id: uuidv4(),
      boardId: 'board-medical',
      label: 'In Progress',
      color: '#3B82F6',
      order: 2,
    },
    {
      id: uuidv4(),
      boardId: 'board-medical',
      label: 'Done',
      color: '#10B981',
      order: 3,
    },
  ];

  const bankingStatuses = [
    {
      id: uuidv4(),
      boardId: 'board-banking',
      label: 'Waiting',
      color: '#F59E0B',
      order: 1,
    },
    {
      id: uuidv4(),
      boardId: 'board-banking',
      label: 'Serving',
      color: '#3B82F6',
      order: 2,
    },
    {
      id: uuidv4(),
      boardId: 'board-banking',
      label: 'Completed',
      color: '#10B981',
      order: 3,
    },
  ];

  const adminStatuses = [
    {
      id: uuidv4(),
      boardId: 'board-admin',
      label: 'Pending',
      color: '#F59E0B',
      order: 1,
    },
    {
      id: uuidv4(),
      boardId: 'board-admin',
      label: 'Processing',
      color: '#3B82F6',
      order: 2,
    },
    {
      id: uuidv4(),
      boardId: 'board-admin',
      label: 'Approved',
      color: '#10B981',
      order: 3,
    },
    {
      id: uuidv4(),
      boardId: 'board-admin',
      label: 'Rejected',
      color: '#EF4444',
      order: 4,
    },
  ];

  await db.insert(queueStatuses).values([...medicalStatuses, ...bankingStatuses, ...adminStatuses]);
  console.log('✅ Seeded queue statuses:', medicalStatuses.length + bankingStatuses.length + adminStatuses.length);

  console.log('🎉 Seeding completed!');
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
