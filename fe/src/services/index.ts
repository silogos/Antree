/**
 * Services exports
 * Central export point for all services
 *
 * Usage:
 * - Mock services: For development without backend
 * - Real API services: For production with backend
 */

// Mock Services (for development)
export { mockQueueService } from './mockQueueService';
export { mockStatusService } from './mockStatusService';

// Real API Services (for production)
export { boardService } from './apiBoardService';
export { queueService } from './apiQueueService';
export { statusService } from './apiStatusService';

// SSE Client (for real-time updates)
export { SSEClient, getSSEClient } from './sseClient';

// API Types
export type { ApiResponse, ApiErrorResponse } from './apiBoardService';
