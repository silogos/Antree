import type {
  CreateStatusInput,
  QueueStatus,
  UpdateStatusInput,
} from "../types";
import type { ApiResponse } from "./board.service";
import http from "./http";

/**
 * API Service - Statuses
 */
export const statusService = {
  /**
   * Get all statuses for a batch
   */
  async getStatuses(queueId: string): Promise<ApiResponse<QueueStatus[]>> {
    return http.get<ApiResponse<QueueStatus[]>>("/statuses", {
      params: { queueId },
      withAuth: false,
    });
  },

  /**
   * Get a single status by ID
   */
  async getStatusById(id: string): Promise<ApiResponse<QueueStatus>> {
    return http.get<ApiResponse<QueueStatus>>(`/statuses/${id}`, {
      withAuth: false,
    });
  },

  /**
   * Create a new status
   */
  async createStatus(
    data: CreateStatusInput,
  ): Promise<ApiResponse<QueueStatus>> {
    return http.post<ApiResponse<QueueStatus>>("/statuses", data, {
      withAuth: false,
    });
  },

  /**
   * Update an existing status
   */
  async updateStatus(
    id: string,
    data: Omit<UpdateStatusInput, "id">,
  ): Promise<ApiResponse<QueueStatus>> {
    return http.put<ApiResponse<QueueStatus>>(`/statuses/${id}`, data, {
      withAuth: false,
    });
  },

  /**
   * Delete a status
   */
  async deleteStatus(id: string): Promise<ApiResponse<{ id: string }>> {
    return http.delete<ApiResponse<{ id: string }>>(`/statuses/${id}`, {
      withAuth: false,
    });
  },
};
