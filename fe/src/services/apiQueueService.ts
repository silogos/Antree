import { apiRequest, ApiResponse } from './apiBoardService';
import type { QueueItem, CreateQueueInput, UpdateQueueInput } from '../types';

/**
 * API Service - Queue Items (queue-items endpoint)
 */
export const queueItemService = {
  /**
   * Get all queue items (optionally filtered by queue or status)
   */
  async getQueueItems(params?: { queueId?: string; statusId?: string }): Promise<ApiResponse<QueueItem[]>> {
    const queryParams = new URLSearchParams();
    if (params?.queueId) queryParams.append('queueId', params.queueId);
    if (params?.statusId) queryParams.append('statusId', params.statusId);

    const endpoint = queryParams.toString() ? `/queue-items?${queryParams.toString()}` : '/queue-items';
    return apiRequest<QueueItem[]>(endpoint);
  },

  /**
   * Get a single queue item by ID
   */
  async getQueueItemById(id: string): Promise<ApiResponse<QueueItem>> {
    return apiRequest<QueueItem>(`/queue-items/${id}`);
  },

  /**
   * Create a new queue item
   */
  async createQueueItem(data: CreateQueueInput): Promise<ApiResponse<QueueItem>> {
    return apiRequest<QueueItem>('/queue-items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing queue item
   */
  async updateQueueItem(id: string, data: Partial<UpdateQueueInput>): Promise<ApiResponse<QueueItem>> {
    return apiRequest<QueueItem>(`/queue-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a queue item
   */
  async deleteQueueItem(id: string): Promise<ApiResponse<{ id: string }>> {
    return apiRequest<{ id: string }>(`/queue-items/${id}`, {
      method: 'DELETE',
    });
  },
};

// Export as queueService for backward compatibility
export const queueService = queueItemService;
