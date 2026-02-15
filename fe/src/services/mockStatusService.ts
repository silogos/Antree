import type { QueueStatus } from '../types';

/**
 * Default queue statuses
 */
const defaultStatuses: QueueStatus[] = [
  {
    id: 'pending',
    boardId: 'board-1',
    label: 'Waiting',
    color: '#f59e0b', // yellow-500
    order: 1,
  },
  {
    id: 'in-progress',
    boardId: 'board-1',
    label: 'In Progress',
    color: '#3b82f6', // blue-500
    order: 2,
  },
  {
    id: 'done',
    boardId: 'board-1',
    label: 'Done',
    color: '#22c55e', // green-500
    order: 3,
  },
];

/**
 * In-memory storage for statuses (simulating database)
 */
let statuses: QueueStatus[] = [...defaultStatuses];

/**
 * Mock Status Service
 * Simulates API calls for status operations with Promise + setTimeout
 */
export const mockStatusService = {
  /**
   * Get all statuses
   * @returns Promise resolving to array of all statuses
   */
  async getStatuses(): Promise<QueueStatus[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...statuses]);
      }, 300); // Simulate network delay
    });
  },

  /**
   * Get a single status by ID
   * @param id - Status ID
   * @returns Promise resolving to single status or undefined if not found
   */
  async getStatusById(id: string): Promise<QueueStatus | undefined> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const status = statuses.find((s) => s.id === id);
        resolve(status);
      }, 200); // Simulate network delay
    });
  },

  /**
   * Create a new status
   * @param data - Status creation data
   * @returns Promise resolving to created status
   */
  async createStatus(data: { boardId: string; label: string; color: string; order: number }): Promise<QueueStatus> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newStatus: QueueStatus = {
          id: Date.now().toString(),
          boardId: data.boardId,
          label: data.label,
          color: data.color,
          order: data.order,
        };
        statuses.push(newStatus);
        resolve(newStatus);
      }, 500); // Simulate network delay
    });
  },

  /**
   * Update an existing status
   * @param id - Status ID
   * @param data - Update data
   * @returns Promise resolving to updated status
   */
  async updateStatus(id: string, data: Partial<QueueStatus>): Promise<QueueStatus> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = statuses.findIndex((s) => s.id === id);
        if (index !== -1) {
          statuses[index] = {
            ...statuses[index],
            ...data,
          };
          resolve(statuses[index]);
        } else {
          throw new Error(`Status with id ${id} not found`);
        }
      }, 400); // Simulate network delay
    });
  },

  /**
   * Delete a status by ID
   * @param id - Status ID
   * @returns Promise resolving to void
   */
  async deleteStatus(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = statuses.findIndex((s) => s.id === id);
        if (index !== -1) {
          statuses.splice(index, 1);
          resolve();
        } else {
          reject(new Error(`Status with id ${id} not found`));
        }
      }, 300); // Simulate network delay
    });
  },
};
