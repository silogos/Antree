/**
 * Type definitions for queue, board, and status entities
 * These are TypeScript interfaces for runtime use, matching the backend API contract
 */

/**
 * Queue Board - Represents a queue board (Kanban board)
 */
export interface QueueBoard {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Queue Item - Represents a single customer in the queue
 */
export interface QueueItem {
  id: string;
  boardId: string;
  queueNumber: string;
  name: string;
  statusId: string;
  createdAt: string;
  updatedAt: string;
  /** Optional custom data (JSONB) stored with the queue item */
  metadata?: Record<string, any>;
}

/**
 * Queue Status - Represents a status for queue items in a board
 */
export interface QueueStatus {
  id: string;
  boardId: string;
  label: string;
  color: string;
  order: number;
}

/**
 * Create Board Input - Input for creating a new board
 */
export interface CreateBoardInput {
  name: string;
  description?: string;
  isActive?: boolean;
}

/**
 * Update Board Input - Input for updating an existing board
 */
export interface UpdateBoardInput {
  id: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

/**
 * Create Queue Input - Input for creating a new queue item
 */
export interface CreateQueueInput {
  boardId: string;
  queueNumber: string;
  name: string;
  statusId: string;
  metadata?: Record<string, any>;
}

/**
 * Update Queue Input - Input for updating an existing queue item
 */
export interface UpdateQueueInput {
  id: string;
  name?: string;
  statusId?: string;
  metadata?: Record<string, any>;
}

/**
 * Create Status Input - Input for creating a new queue status
 */
export interface CreateStatusInput {
  boardId: string;
  label: string;
  color: string;
  order: number;
}

/**
 * Update Status Input - Input for updating an existing queue status
 */
export interface UpdateStatusInput {
  id: string;
  label?: string;
  color?: string;
  order?: number;
}

/**
 * SSE Event Types
 */
export type SSEEventType =
  | 'connected'
  | 'queue_created'
  | 'queue_updated'
  | 'queue_deleted'
  | 'status_created'
  | 'status_updated'
  | 'status_deleted'
  | 'board_updated'
  | 'board_deleted';

/**
 * SSE Event - Server-Sent Event payload
 */
export interface SSEEvent<T = unknown> {
  type: SSEEventType;
  data: T;
  timestamp: string;
}
