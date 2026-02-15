import { apiRequest, ApiResponse } from './apiBoardService';
import type { QueueBatch, CreateBatchInput, UpdateBatchInput } from '../types';

/**
 * API Service - Batches
 */
export const batchService = {
  /**
   * Get all batches
   */
  async getBatches(params?: { queueId?: string; status?: string }): Promise<ApiResponse<QueueBatch[]>> {
    const queryParams = new URLSearchParams();
    if (params?.queueId) queryParams.append('queueId', params.queueId);
    if (params?.status) queryParams.append('status', params.status);

    const endpoint = queryParams.toString() ? `/batches?${queryParams.toString()}` : '/batches';
    return apiRequest<QueueBatch[]>(endpoint);
  },

  /**
   * Get a single batch by ID
   */
  async getBatchById(id: string): Promise<ApiResponse<QueueBatch>> {
    return apiRequest<QueueBatch>(`/batches/${id}`);
  },

  /**
   * Create a new batch (copies statuses from template)
   */
  async createBatch(data: { queueId: string; name?: string; status?: 'active' | 'closed' }): Promise<ApiResponse<QueueBatch>> {
    return apiRequest<QueueBatch>('/batches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing batch
   */
  async updateBatch(id: string, data: { name?: string; status?: 'active' | 'closed' }): Promise<ApiResponse<QueueBatch>> {
    return apiRequest<QueueBatch>(`/batches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a batch
   */
  async deleteBatch(id: string): Promise<ApiResponse<{ id: string }>> {
    return apiRequest<{ id: string }>(`/batches/${id}`, {
      method: 'DELETE',
    });
  },
};
