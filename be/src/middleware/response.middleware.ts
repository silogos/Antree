/**
 * Standard API Response Format
 */

import type { PaginationMeta } from "../lib/pagination.js";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
  message?: string;
  total?: number;
  meta?: PaginationMeta;
  requestId?: string;
  details?: Record<string, unknown>;
}

/**
 * Error code enumeration for standardized error handling
 */
export enum ErrorCode {
  // Validation errors (400)
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INVALID_INPUT = "INVALID_INPUT",
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",

  // Not found errors (404)
  NOT_FOUND = "NOT_FOUND",
  QUEUE_NOT_FOUND = "QUEUE_NOT_FOUND",
  SESSION_NOT_FOUND = "SESSION_NOT_FOUND",
  ITEM_NOT_FOUND = "ITEM_NOT_FOUND",
  TEMPLATE_NOT_FOUND = "TEMPLATE_NOT_FOUND",
  STATUS_NOT_FOUND = "STATUS_NOT_FOUND",

  // Conflict errors (409)
  ALREADY_EXISTS = "ALREADY_EXISTS",
  DUPLICATE_ENTRY = "DUPLICATE_ENTRY",
  CONFLICT = "CONFLICT",

  // Foreign key errors (409)
  FOREIGN_KEY_VIOLATION = "FOREIGN_KEY_VIOLATION",
  IN_USE = "IN_USE",

  // Rate limiting (429)
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",

  // Server errors (500)
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * Generate a unique request ID for error tracking
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Success response helper
 */
export function successResponse<T>(
  data: T,
  message?: string,
  totalOrMeta?: number | PaginationMeta,
  requestId?: string
): ApiResponse<T> {
  const response: ApiResponse<T> = { success: true, data: data };
  if (message) response.message = message;

  // Handle both legacy total number and new metadata object
  if (typeof totalOrMeta === "number") {
    response.total = totalOrMeta;
  } else if (totalOrMeta && typeof totalOrMeta === "object") {
    response.meta = totalOrMeta;
    response.total = totalOrMeta.total;
  }

  if (requestId) response.requestId = requestId;
  return response;
}

/**
 * Error response helper
 */
export function errorResponse(
  errorCode: ErrorCode,
  message: string,
  requestId?: string,
  details?: Record<string, unknown>
): ApiResponse {
  return {
    success: false,
    error: errorCode,
    errorCode,
    message,
    ...(requestId && { requestId }),
    ...(details && { details }),
  };
}

/**
 * Not found response helper
 */
export function notFoundResponse(resource: string, id: string, requestId?: string): ApiResponse {
  const errorCode = ErrorCode.NOT_FOUND;
  return errorResponse(errorCode, `${resource} with id "${id}" not found`, requestId, {
    resource,
    id,
  });
}

/**
 * Validation error response helper
 */
export function validationErrorResponse(
  message: string,
  requestId?: string,
  details?: Record<string, unknown>
): ApiResponse {
  return errorResponse(ErrorCode.VALIDATION_ERROR, message, requestId, details);
}

/**
 * Internal error response helper
 */
export function internalErrorResponse(error: unknown, requestId?: string): ApiResponse {
  console.error(`[Error ${requestId || "unknown"}]`, error);

  if (error instanceof Error) {
    return errorResponse(
      ErrorCode.INTERNAL_SERVER_ERROR,
      "An unexpected error occurred. Please try again later.",
      requestId,
      {
        message: process.env.NODE_ENV === "development" ? error.message : undefined,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      }
    );
  }

  return errorResponse(
    ErrorCode.UNKNOWN_ERROR,
    "An unknown error occurred. Please try again later.",
    requestId
  );
}

/**
 * Database error response helper
 */
export function databaseErrorResponse(error: unknown, requestId?: string): ApiResponse {
  console.error(`[Database Error ${requestId || "unknown"}]`, error);

  if (error instanceof Error) {
    // Check for specific database error types
    const errorMessage = error.message.toLowerCase();

    if (errorMessage.includes("violates foreign key constraint")) {
      return errorResponse(
        ErrorCode.FOREIGN_KEY_VIOLATION,
        "This record cannot be deleted because it is referenced by other records.",
        requestId
      );
    }

    if (errorMessage.includes("duplicate key") || errorMessage.includes("unique constraint")) {
      return errorResponse(
        ErrorCode.DUPLICATE_ENTRY,
        "A record with this value already exists.",
        requestId
      );
    }

    if (errorMessage.includes("not-null constraint") || errorMessage.includes("null value")) {
      return errorResponse(
        ErrorCode.MISSING_REQUIRED_FIELD,
        "A required field is missing.",
        requestId
      );
    }
  }

  return errorResponse(
    ErrorCode.DATABASE_ERROR,
    "A database error occurred. Please try again later.",
    requestId,
    { message: process.env.NODE_ENV === "development" ? String(error) : undefined }
  );
}
