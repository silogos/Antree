/**
 * Services exports
 * Central export point for all services
 */

// API Types
export type { ApiErrorResponse, ApiResponse } from "../types/http.types";

// API Services
export { boardService } from "../types/http.types";
export type { HttpInstance, HttpRequestConfig } from "./http";
// HTTP Client
export { default as http } from "./http";
export { queueItemService, queueService } from "./queue.service";
export { queueService as queueListService } from "./queue-list.service";

// SSE Client (for real-time updates)
export { getSSEClient, SSEClient } from "./sseClient";
export { statusService } from "./status.service";
