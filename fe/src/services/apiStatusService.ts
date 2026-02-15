import { apiRequest, ApiResponse } from './apiBoardService';
import type { QueueStatus, CreateStatusInput, UpdateStatusInput } from '../types';

/**
 * API Service - Statuses
 */
export const statusService = {
  /**
   * Get all statuses for a batch
   */
  async getStatuses(queueId: string): Promise<ApiResponse<QueueStatus[]>> {
    return apiRequest<QueueStatus[]>(`/statuses?queueId=${queueId}`);
  },

  /**
   * Get a single status by ID
   */
  async getStatusById(id: string): Promise<ApiResponse<QueueStatus>> {
    return apiRequest<QueueStatus>(`/statuses/${id}`);
  },

  /**
   * Create a new status
   */
  async createStatus(data: CreateStatusInput): Promise<ApiResponse<QueueStatus>> {
    return apiRequest<QueueStatus>('/statuses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing status
   */
  async updateStatus(id: string, data: Omit<UpdateStatusInput, 'id'>): Promise<ApiResponse<QueueStatus>> {
    return apiRequest<QueueStatus>(`/statuses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a status
   */
  async deleteStatus(id: string): Promise<ApiResponse<{ id: string }>> {
    return apiRequest<{ id: string }>(`/statuses/${id}`, {
      method: 'DELETE',
    });
  },
};
