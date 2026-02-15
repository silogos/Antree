import { QueueItem } from '../types';
import { dummyQueues } from '../data/dummyQueues';

/**
 * Mock Queue Service
 * Simulates API calls for queue operations with Promise + setTimeout
 */
export const mockQueueService = {
  /**
   * Get all queues
   * @returns Promise resolving to array of all queues
   */
  async getQueues(): Promise<QueueItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...dummyQueues]);
      }, 500); // Simulate network delay
    });
  },

  /**
   * Get a single queue by ID
   * @param id - Queue ID
   * @returns Promise resolving to single queue or undefined if not found
   */
  async getQueueById(id: string): Promise<QueueItem | undefined> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const queue = dummyQueues.find((q) => q.id === id);
        resolve(queue);
      }, 300); // Simulate network delay
    });
  },

  /**
   * Create a new queue
   * @param data - Queue creation data
   * @returns Promise resolving to created queue
   */
  async createQueue(data: { boardId: string; queueNumber: string; name: string; statusId: string; metadata?: Record<string, any> }): Promise<QueueItem> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newQueue: QueueItem = {
          id: Date.now().toString(),
          boardId: data.boardId,
          queueNumber: data.queueNumber,
          name: data.name,
          statusId: data.statusId,
          metadata: data.metadata,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        dummyQueues.push(newQueue);
        resolve(newQueue);
      }, 800); // Simulate network delay
    });
  },

  /**
   * Update an existing queue
   * @param id - Queue ID
   * @param data - Update data
   * @returns Promise resolving to updated queue
   */
  async updateQueue(id: string, data: Partial<QueueItem>): Promise<QueueItem> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = dummyQueues.findIndex((q) => q.id === id);
        if (index !== -1) {
          dummyQueues[index] = {
            ...dummyQueues[index],
            ...data,
            updatedAt: new Date().toISOString(),
          };
          resolve(dummyQueues[index]);
        } else {
          throw new Error(`Queue with id ${id} not found`);
        }
      }, 600); // Simulate network delay
    });
  },

  /**
   * Delete a queue by ID
   * @param id - Queue ID
   * @returns Promise resolving to void
   */
  async deleteQueue(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = dummyQueues.findIndex((q) => q.id === id);
        if (index !== -1) {
          dummyQueues.splice(index, 1);
          resolve();
        } else {
          reject(new Error(`Queue with id ${id} not found`));
        }
      }, 400); // Simulate network delay
    });
  },
};
