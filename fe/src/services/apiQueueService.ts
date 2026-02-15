import { apiRequest, ApiResponse } from './apiBoardService';
import type { QueueItem, CreateQueueInput, UpdateQueueInput } from '../types';

/**
 * API Service - Queues
 */
export const queueService = {
  /**
   * Get all queues (optionally filtered by board or status)
   */
  async getQueues(params?: { boardId?: string; statusId?: string }): Promise<ApiResponse<QueueItem[]>> {
    const queryParams = new URLSearchParams();
    if (params?.boardId) queryParams.append('boardId', params.boardId);
    if (params?.statusId) queryParams.append('statusId', params.statusId);

    const endpoint = queryParams.toString() ? `/queues?${queryParams.toString()}` : '/queues';
    return apiRequest<QueueItem[]>(endpoint);
  },

  /**
   * Get a single queue by ID
   */
  async getQueueById(id: string): Promise<ApiResponse<QueueItem>> {
    return apiRequest<QueueItem>(`/queues/${id}`);
  },

  /**
   * Create a new queue
   */
  async createQueue(data: CreateQueueInput): Promise<ApiResponse<QueueItem>> {
    return apiRequest<QueueItem>('/queues', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing queue
   */
  async updateQueue(id: string, data: Partial<UpdateQueueInput>): Promise<ApiResponse<QueueItem>> {
    return apiRequest<QueueItem>(`/queues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a queue
   */
  async deleteQueue(id: string): Promise<ApiResponse<{ id: string }>> {
    return apiRequest<{ id: string }>(`/queues/${id}`, {
      method: 'DELETE',
    });
  },
};
