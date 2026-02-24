import type { CreateQueueItemInput, QueueItem, UpdateQueueItemInput } from "../types";
import type { ApiResponse } from "../types/http.types";
import http from "./http.service";

/**
 * API Service - Queue Items (queue-items endpoint)
 */
export const queueItemService = {
  /**
   * Get all queue items for a specific queue/batch
   * Uses RESTful endpoint /queues/:id/items
   */
  async getQueueItems(params?: {
    queueId?: string;
    statusId?: string;
    sessionId?: string;
  }): Promise<ApiResponse<QueueItem[]>> {
    // Use /queues/:id/items endpoint when queueId is provided
    if (params?.queueId) {
      const queryParams: { statusId?: string } = {};
      if (params.statusId) {
        queryParams.statusId = params.statusId;
      }

      return http.get<ApiResponse<QueueItem[]>>(`/queues/${params.queueId}/items`, {
        params: queryParams,
        withAuth: false,
      });
    }

    // Use /sessions/:sessionId/items endpoint when sessionId is provided
    if (params?.sessionId) {
      const queryParams: { statusId?: string } = {};
      if (params.statusId) {
        queryParams.statusId = params.statusId;
      }

      return http.get<ApiResponse<QueueItem[]>>(`/sessions/${params.sessionId}/items`, {
        params: queryParams,
        withAuth: false,
      });
    }

    // Fallback to /items for general queries (no filter)
    return http.get<ApiResponse<QueueItem[]>>("/items", {
      params,
      withAuth: false,
    });
  },

  /**
   * Get a single queue item by ID
   */
  async getQueueItemById(id: string): Promise<ApiResponse<QueueItem>> {
    return http.get<ApiResponse<QueueItem>>(`/items/${id}`, {
      withAuth: false,
    });
  },

  /**
   * Create a new queue item
   */
  async createQueueItem(
    data: CreateQueueItemInput,
  ): Promise<ApiResponse<QueueItem>> {
    return http.post<ApiResponse<QueueItem>>("/items", data, {
      withAuth: false,
    });
  },

  /**
   * Create a new queue item via session endpoint
   * This endpoint derives queueId and sessionId from the session
   */
  async createQueueItemViaSession(
    sessionId: string,
    data: { name?: string; statusId?: string; queueNumber?: string; metadata?: Record<string, any> | null },
  ): Promise<ApiResponse<QueueItem>> {
    return http.post<ApiResponse<QueueItem>>(`/sessions/${sessionId}/items`, data, {
      withAuth: false,
    });
  },

  /**
   * Update an existing queue item
   */
  async updateQueueItem(
    id: string,
    data: Partial<UpdateQueueItemInput>,
  ): Promise<ApiResponse<QueueItem>> {
    return http.put<ApiResponse<QueueItem>>(`/items/${id}`, data, {
      withAuth: false,
    });
  },

  /**
   * Delete a queue item
   */
  async deleteQueueItem(id: string): Promise<ApiResponse<{ id: string }>> {
    return http.delete<ApiResponse<{ id: string }>>(`/items/${id}`, {
      withAuth: false,
    });
  },
};

// Export as queueService for backward compatibility
export const queueService = queueItemService;
