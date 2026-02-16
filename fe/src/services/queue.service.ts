import type { CreateQueueInput, QueueItem, UpdateQueueInput } from "../types";
import type { ApiResponse } from "./board.service";
import http from "./http";

/**
 * API Service - Queue Items (queue-items endpoint)
 */
export const queueItemService = {
  /**
   * Get all queue items (optionally filtered by queue or status)
   */
  async getQueueItems(params?: {
    queueId?: string;
    statusId?: string;
  }): Promise<ApiResponse<QueueItem[]>> {
    return http.get<ApiResponse<QueueItem[]>>("/queue-items", {
      params,
      withAuth: false,
    });
  },

  /**
   * Get a single queue item by ID
   */
  async getQueueItemById(id: string): Promise<ApiResponse<QueueItem>> {
    return http.get<ApiResponse<QueueItem>>(`/queue-items/${id}`, {
      withAuth: false,
    });
  },

  /**
   * Create a new queue item
   */
  async createQueueItem(
    data: CreateQueueInput,
  ): Promise<ApiResponse<QueueItem>> {
    return http.post<ApiResponse<QueueItem>>("/queue-items", data, {
      withAuth: false,
    });
  },

  /**
   * Update an existing queue item
   */
  async updateQueueItem(
    id: string,
    data: Partial<UpdateQueueInput>,
  ): Promise<ApiResponse<QueueItem>> {
    return http.put<ApiResponse<QueueItem>>(`/queue-items/${id}`, data, {
      withAuth: false,
    });
  },

  /**
   * Delete a queue item
   */
  async deleteQueueItem(id: string): Promise<ApiResponse<{ id: string }>> {
    return http.delete<ApiResponse<{ id: string }>>(`/queue-items/${id}`, {
      withAuth: false,
    });
  },
};

// Export as queueService for backward compatibility
export const queueService = queueItemService;
