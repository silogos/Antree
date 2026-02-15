import { QueueItem } from '../types';

/**
 * Dummy queues for development
 * In-memory storage simulating backend data
 * Matches new backend schema with boardId and metadata
 */
export const dummyQueues: QueueItem[] = [
  {
    id: '1',
    boardId: 'board-1',
    queueNumber: '1',
    name: 'Medical Checkup',
    statusId: 'pending',
    metadata: {
      customerName: 'Muhammad Arif',
      duration: '15:00',
      priority: 'normal',
      category: 'routine',
    },
    createdAt: '2025-02-13T08:30:00.000Z',
    updatedAt: '2025-02-13T08:30:00.000Z',
  },
  {
    id: '2',
    boardId: 'board-1',
    queueNumber: '2',
    name: 'Vaccination',
    statusId: 'in-progress',
    metadata: {
      customerName: 'Siti Aminah',
      duration: '30:00',
      priority: 'high',
      category: 'vaccination',
    },
    createdAt: '2025-02-13T08:35:00.000Z',
    updatedAt: '2025-02-13T08:35:00.000Z',
  },
  {
    id: '3',
    boardId: 'board-1',
    queueNumber: '3',
    name: 'Consultation',
    statusId: 'pending',
    metadata: {
      customerName: 'Ahmad Fauzi',
      duration: '10:00',
      priority: 'normal',
    },
    createdAt: '2025-02-13T08:40:00.000Z',
    updatedAt: '2025-02-13T08:40:00.000Z',
  },
  {
    id: '4',
    boardId: 'board-1',
    queueNumber: '4',
    name: 'Banking',
    statusId: 'pending',
    metadata: {
      customerName: 'Fatimah Zahra',
      duration: '20:00',
      priority: 'normal',
      transactionType: 'transfer',
    },
    createdAt: '2025-02-13T08:45:00.000Z',
    updatedAt: '2025-02-13T08:45:00.000Z',
  },
  {
    id: '5',
    boardId: 'board-1',
    queueNumber: '5',
    name: 'Insurance',
    statusId: 'pending',
    metadata: {
      customerName: 'Abdullah Rahman',
      duration: '25:00',
      priority: 'normal',
      product: 'life_insurance',
    },
    createdAt: '2025-02-13T09:00:00.000Z',
    updatedAt: '2025-02-13T09:00:00.000Z',
  },
];
