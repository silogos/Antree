/**
 * API Configuration
 */

import http from "./http";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001";

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  total?: number;
  details?: Array<{ field: string; message: string }>;
}

/**
 * Generic API error response
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
}

/**
 * API Service - Boards
 */
export const boardService = {
  /**
   * Get all boards
   */
  async getBoards(): Promise<ApiResponse<import("../types").QueueBoard[]>> {
    return http.get<ApiResponse<import("../types").QueueBoard[]>>("/boards", {
      withAuth: false,
    });
  },

  /**
   * Get a single board by ID
   */
  async getBoardById(
    id: string,
  ): Promise<ApiResponse<import("../types").QueueBoard>> {
    return http.get<ApiResponse<import("../types").QueueBoard>>(
      `/boards/${id}`,
      { withAuth: false },
    );
  },

  /**
   * Create a new board
   */
  async createBoard(
    data: import("../types").CreateBoardInput,
  ): Promise<ApiResponse<import("../types").QueueBoard>> {
    return http.post<ApiResponse<import("../types").QueueBoard>>(
      "/boards",
      data,
      { withAuth: false },
    );
  },

  /**
   * Update an existing board
   */
  async updateBoard(
    id: string,
    data: Partial<import("../types").CreateBoardInput>,
  ): Promise<ApiResponse<import("../types").QueueBoard>> {
    return http.put<ApiResponse<import("../types").QueueBoard>>(
      `/boards/${id}`,
      data,
      { withAuth: false },
    );
  },

  /**
   * Delete a board
   */
  async deleteBoard(id: string): Promise<ApiResponse<{ id: string }>> {
    return http.delete<ApiResponse<{ id: string }>>(`/boards/${id}`, {
      withAuth: false,
    });
  },
};
