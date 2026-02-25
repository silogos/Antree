/**
 * Pagination Utilities
 * Shared types and utilities for pagination across API endpoints
 */

/**
 * Pagination parameters interface
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

/**
 * Pagination metadata interface
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasMore: boolean;
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Default pagination values
 */
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

/**
 * Parse and validate pagination parameters from query string
 */
export function parsePaginationParams(
  query: Record<string, string | string[] | undefined>
): PaginationParams {
  const page = Number(query.page) || DEFAULT_PAGE;
  const limit = Math.min(Math.max(Number(query.limit) || DEFAULT_LIMIT, 1), MAX_LIMIT);
  const sort = query.sort as string | undefined;
  const order = (query.order as string | undefined) === "asc" ? "asc" : "desc";

  return {
    page: Math.max(page, 1),
    limit,
    sort,
    order,
  };
}

/**
 * Calculate pagination metadata
 */
export function calculatePaginationMetadata(
  total: number,
  page: number,
  limit: number
): PaginatedResponse<never>["meta"] {
  const pages = Math.ceil(total / limit);
  const hasMore = page < pages;

  return {
    total,
    page,
    limit,
    pages,
    hasMore,
  };
}

/**
 * Apply pagination offset and limit to a number
 */
export function getPaginationOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}
