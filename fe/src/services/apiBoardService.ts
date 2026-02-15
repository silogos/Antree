/**
 * API Configuration
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
 * HTTP Request helper
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data: ApiResponse<T> = await response.json();

    if (!response.ok) {
      throw data as ApiErrorResponse;
    }

    return data;
  } catch (error) {
    if (error && typeof error === 'object' && 'success' in error) {
      throw error as ApiErrorResponse;
    }

    // Network error or non-JSON response
    throw {
      success: false,
      error: 'Network Error',
      message: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

/**
 * API Service - Boards
 */
export const boardService = {
  /**
   * Get all boards
   */
  async getBoards(): Promise<ApiResponse<import('../types').QueueBoard[]>> {
    return apiRequest<import('../types').QueueBoard[]>('/boards');
  },

  /**
   * Get a single board by ID
   */
  async getBoardById(id: string): Promise<ApiResponse<import('../types').QueueBoard>> {
    return apiRequest<import('../types').QueueBoard>(`/boards/${id}`);
  },

  /**
   * Create a new board
   */
  async createBoard(data: import('../types').CreateBoardInput): Promise<ApiResponse<import('../types').QueueBoard>> {
    return apiRequest<import('../types').QueueBoard>('/boards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing board
   */
  async updateBoard(id: string, data: Partial<import('../types').CreateBoardInput>): Promise<ApiResponse<import('../types').QueueBoard>> {
    return apiRequest<import('../types').QueueBoard>(`/boards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a board
   */
  async deleteBoard(id: string): Promise<ApiResponse<{ id: string }>> {
    return apiRequest<{ id: string }>(`/boards/${id}`, {
      method: 'DELETE',
    });
  },
};
