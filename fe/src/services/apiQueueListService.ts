import { apiRequest, ApiResponse } from './apiBoardService';
import type { Queue } from '../types';

/**
 * API Service - Queues (queue management, not queue items)
 */
export const queueService = {
  /**
   * Get all queues
   */
  async getQueues(params?: { templateId?: string; isActive?: boolean }): Promise<ApiResponse<Queue[]>> {
    const queryParams = new URLSearchParams();
    if (params?.templateId) queryParams.append('templateId', params.templateId);
    if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive));

    const endpoint = queryParams.toString() ? `/queues?${queryParams.toString()}` : '/queues';
    return apiRequest<Queue[]>(endpoint);
  },

  /**
   * Get a single queue by ID
   */
  async getQueueById(id: string): Promise<ApiResponse<Queue>> {
    return apiRequest<Queue>(`/queues/${id}`);
  },

  /**
   * Get active batch for a queue
   */
  async getActiveBatch(queueId: string): Promise<ApiResponse<{ batch: any; statuses: any[] } | null>> {
    return apiRequest<{ batch: any; statuses: any[] }>(`/queues/${queueId}/active-batch`);
  },

  /**
   * Reset queue (close current active batch, create new batch)
   */
  async resetQueue(queueId: string, data?: { name?: string }): Promise<ApiResponse<any>> {
    return apiRequest(`/queues/${queueId}/reset`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  },

  /**
   * Create a new queue
   */
  async createQueue(data: { name: string; templateId: string; createdBy?: string; updatedBy?: string; isActive?: boolean }): Promise<ApiResponse<Queue>> {
    return apiRequest<Queue>('/queues', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing queue
   */
  async updateQueue(id: string, data: { name?: string; isActive?: boolean; updatedBy?: string }): Promise<ApiResponse<Queue>> {
    return apiRequest<Queue>(`/queues/${id}`, {
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
