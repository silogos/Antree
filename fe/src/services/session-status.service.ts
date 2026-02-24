import type { QueueStatus } from "../types";
import type { ApiResponse } from "../types/http.types";
import http from "./http.service";

/**
 * API Service - Session Statuses
 * Based on OpenAPI spec
 */
export const sessionStatusService = {
  /**
   * Get all statuses for a session
   */
  async getSessionStatuses(
    sessionId: string,
  ): Promise<ApiResponse<QueueStatus[]>> {
    return http.get<ApiResponse<QueueStatus[]>>(
      `/sessions/${sessionId}/statuses`,
      {
        withAuth: false,
      },
    );
  },

  /**
   * Get a single session status by ID
   */
  async getSessionStatusById(id: string): Promise<ApiResponse<QueueStatus>> {
    return http.get<ApiResponse<QueueStatus>>(`/session-statuses/${id}`, {
      withAuth: false,
    });
  },

  /**
   * Update a session status (label, color, order)
   * Uses PATCH per OpenAPI spec
   */
  async updateSessionStatus(
    id: string,
    data: {
      label?: string;
      color?: string;
      order?: number;
    },
  ): Promise<ApiResponse<QueueStatus>> {
    return http.patch<ApiResponse<QueueStatus>>(`/session-statuses/${id}`, data, {
      withAuth: false,
    });
  },

  /**
   * Delete a session status
   */
  async deleteSessionStatus(id: string): Promise<ApiResponse<{ id: string }>> {
    return http.delete<ApiResponse<{ id: string }>>(`/session-statuses/${id}`, {
      withAuth: false,
    });
  },
};
