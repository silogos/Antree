import type { Queue } from "../types";
import type { ApiResponse } from "../types/http.types";
import http from "./http.service";

/**
 * API Service - Queues (queue management, not queue items)
 */
export const queueService = {
  /**
   * Get all queues
   */
  async getQueues(params?: {
    templateId?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<Queue[]>> {
    return http.get<ApiResponse<Queue[]>>("/queues", {
      params,
      withAuth: false,
    });
  },

  /**
   * Get a single queue by ID
   */
  async getQueueById(id: string): Promise<ApiResponse<Queue>> {
    return http.get<ApiResponse<Queue>>(`/queues/${id}`, { withAuth: false });
  },

  /**
   * Get active batch for a queue
   */
  async getActiveBatch(
    queueId: string
  ): Promise<ApiResponse<{ batch: unknown; statuses: unknown[] } | null>> {
    return http.get<ApiResponse<{ batch: unknown; statuses: unknown[] } | null>>(
      `/queues/${queueId}/active-batch`,
      { withAuth: false }
    );
  },

  /**
   * Reset queue (close current active batch, create new batch)
   */
  async resetQueue(queueId: string, data?: { name?: string }): Promise<ApiResponse<unknown>> {
    return http.post<ApiResponse<unknown>>(`/queues/${queueId}/reset`, data || {}, {
      withAuth: false,
    });
  },

  /**
   * Create a new queue
   */
  async createQueue(data: {
    name: string;
    templateId: string;
    createdBy?: string;
    updatedBy?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<Queue>> {
    return http.post<ApiResponse<Queue>>("/queues", data, { withAuth: false });
  },

  /**
   * Update an existing queue
   */
  async updateQueue(
    id: string,
    data: { name?: string; isActive?: boolean; updatedBy?: string }
  ): Promise<ApiResponse<Queue>> {
    return http.put<ApiResponse<Queue>>(`/queues/${id}`, data, {
      withAuth: false,
    });
  },

  /**
   * Delete a queue
   */
  async deleteQueue(id: string): Promise<ApiResponse<{ id: string }>> {
    return http.delete<ApiResponse<{ id: string }>>(`/queues/${id}`, {
      withAuth: false,
    });
  },
};
