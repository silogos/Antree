/**
 * API Configuration
 * Shared API types and configuration for all services
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

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
