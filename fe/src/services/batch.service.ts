import type { QueueBatch } from "../types";
import type { ApiResponse } from "./board.service";
import http from "./http";

/**
 * API Service - Batches
 */
export const batchService = {
  /**
   * Get all batches
   */
  async getBatches(params?: {
    queueId?: string;
    status?: string;
  }): Promise<ApiResponse<QueueBatch[]>> {
    return http.get<ApiResponse<QueueBatch[]>>("/batches", {
      params,
      withAuth: false,
    });
  },

  /**
   * Get a single batch by ID
   */
  async getBatchById(id: string): Promise<ApiResponse<QueueBatch>> {
    return http.get<ApiResponse<QueueBatch>>(`/batches/${id}`, {
      withAuth: false,
    });
  },

  /**
   * Create a new batch (copies statuses from template)
   */
  async createBatch(data: {
    queueId: string;
    name?: string;
    status?: "active" | "closed";
  }): Promise<ApiResponse<QueueBatch>> {
    return http.post<ApiResponse<QueueBatch>>("/batches", data, {
      withAuth: false,
    });
  },

  /**
   * Update an existing batch
   */
  async updateBatch(
    id: string,
    data: { name?: string; status?: "active" | "closed" },
  ): Promise<ApiResponse<QueueBatch>> {
    return http.put<ApiResponse<QueueBatch>>(`/batches/${id}`, data, {
      withAuth: false,
    });
  },

  /**
   * Delete a batch
   */
  async deleteBatch(id: string): Promise<ApiResponse<{ id: string }>> {
    return http.delete<ApiResponse<{ id: string }>>(`/batches/${id}`, {
      withAuth: false,
    });
  },
};
