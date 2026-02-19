/**
 * Standard API Response Format
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  total?: number;
}

/**
 * Convert camelCase string to snake_case
 */
function camelToSnake(str: string): string {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

/**
 * Recursively convert object keys from camelCase to snake_case
 */
function toSnakeCase<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle Date objects - convert to ISO string
  if (obj instanceof Date) {
    return obj.toISOString() as T;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase) as T;
  }

  const result: Record<string, unknown> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = camelToSnake(key);
      result[snakeKey] = toSnakeCase(obj[key]);
    }
  }
  return result as T;
}

/**
 * Success response helper
 */
export function successResponse<T>(
  data: T,
  message?: string,
  total?: number,
): ApiResponse<T> {
  const response: ApiResponse<T> = { success: true, data: toSnakeCase(data) };
  if (message) response.message = message;
  if (total !== undefined) response.total = total;
  return response;
}

/**
 * Error response helper
 */
export function errorResponse(
  error: string,
  message: string,
): ApiResponse {
  return {
    success: false,
    error,
    message,
  };
}

/**
 * Not found response helper
 */
export function notFoundResponse(resource: string, id: string): ApiResponse {
  return errorResponse('Not Found', `${resource} with id ${id} not found`);
}

/**
 * Validation error response helper
 */
export function validationErrorResponse(message: string): ApiResponse {
  return errorResponse('Validation Error', message);
}

/**
 * Internal error response helper
 */
export function internalErrorResponse(error: unknown): ApiResponse {
  return errorResponse(
    'Internal Server Error',
    error instanceof Error ? error.message : 'Unknown error',
  );
}
