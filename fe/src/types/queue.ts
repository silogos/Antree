/**
 * Type definitions for queue, batch, template, and status entities
 * These are TypeScript interfaces for runtime use, matching the backend API contract
 */

/**
 * Queue Template - Represents a template for queue batches
 */
export interface QueueTemplate {
  id: string;
  name: string;
  description?: string;
  isSystemTemplate: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Queue Batch - Represents a queue batch (instance of a template)
 */
export interface QueueBatch {
  id: string;
  queueId: string;
  name: string;
  status: 'active' | 'closed';
  createdAt: string;
  updatedAt: string;
}

/**
 * Queue Item - Represents a single customer in queue
 */
export interface QueueItem {
  id: string;
  queueId: string;
  queueNumber: string;
  name: string;
  statusId: string;
  createdAt: string;
  updatedAt: string;
  /** Optional custom data (JSONB) stored with queue item */
  metadata?: Record<string, any>;
}

/**
 * Queue Status - Represents a status for queue items in a batch
 */
export interface QueueStatus {
  id: string;
  queueId: string;
  templateStatusId?: string;
  label: string;
  color: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Queue Template Status - Represents a status in a template
 */
export interface QueueTemplateStatus {
  id: string;
  templateId: string;
  label: string;
  color: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Queue - Represents a queue created by user
 */
export interface Queue {
  id: string;
  name: string;
  templateId: string;
  createdBy?: string;
  updatedBy?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create Template Input - Input for creating a new template
 */
export interface CreateTemplateInput {
  name: string;
  description?: string;
  isActive?: boolean;
}

/**
 * Update Template Input - Input for updating an existing template
 */
export interface UpdateTemplateInput {
  id: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

/**
 * Create Batch Input - Input for creating a new batch
 */
export interface CreateBatchInput {
  queueId: string;
  name?: string;
  status?: 'active' | 'closed';
}

/**
 * Update Batch Input - Input for updating an existing batch
 */
export interface UpdateBatchInput {
  id: string;
  name?: string;
  status?: 'active' | 'closed';
}

/**
 * Create Queue Input - Input for creating a new queue item
 */
export interface CreateQueueInput {
  queueId: string;
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
  queueId: string;
  label: string;
  color: string;
  order: number;
  templateStatusId?: string;
}

/**
 * Update Status Input - Input for updating an existing queue status
 */
export interface UpdateStatusInput {
  id: string;
  label?: string;
  color?: string;
  order?: number;
  templateStatusId?: string;
}

/**
 * SSE Event Types
 */
export type SSEEventType =
  | 'connected'
  | 'queue_created' | 'queue_updated' | 'queue_deleted' // Queue events (for queue management, not queue items)
  | 'batch_created' | 'batch_updated' | 'batch_deleted' // Batch events
  | 'queue_item_created' | 'queue_item_updated' | 'queue_item_deleted' // Queue item events
  | 'status_created' | 'status_updated' | 'status_deleted'
  | 'board_updated' | 'board_deleted';

export type SSEEvent = {
  type: SSEEventType;
  data: unknown;
  timestamp: string;
}

/**
 * Create Batch Input - Input for creating a new batch
 */
export interface CreateBatchInput {
  queueId: string;
  name?: string;
  status?: 'active' | 'closed';
}

/**
 * Update Batch Input - Input for updating an existing batch
 */
export interface UpdateBatchInput {
  id: string;
  name?: string;
  status?: 'active' | 'closed';
}

/**
 * Create Queue Input - Input for creating a new queue item
 */
export interface CreateQueueInput {
  queueId: string;
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
  queueId: string;
  label: string;
  color: string;
  order: number;
  templateStatusId?: string;
}

/**
 * Update Status Input - Input for updating an existing queue status
 */
export interface UpdateStatusInput {
  id: string;
  label?: string;
  color?: string;
  order?: number;
  templateStatusId?: string;
}

/**
 * SSE Event Types
 */
export type SSEEventType =
  | 'connected'
  | 'queue_created' | 'queue_updated' | 'queue_deleted' // Queue events (for queue management, not queue items)
  | 'batch_created' | 'batch_updated' | 'batch_deleted' // Batch events
  | 'queue_item_created' | 'queue_item_updated' | 'queue_item_deleted' // Queue item events
  | 'status_created' | 'status_updated' | 'status_deleted'
  | 'board_updated' | 'board_deleted';

export type SSEEvent = {
  type: SSEEventType;
  data: unknown;
  timestamp: string;
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
 * Queue Status - Represents a status for queue items in a batch
 */
export interface QueueStatus {
  id: string;
  queueId: string;
  templateStatusId?: string;
  label: string;
  color: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * SSE Event Types
 */
export type SSEEventType =
  | 'connected'
  | 'queue_created' | 'queue_updated' | 'queue_deleted' // Queue events (for queue management, not queue items)
  | 'batch_created' | 'batch_updated' | 'batch_deleted' // Batch events
  | 'queue_item_created' | 'queue_item_updated' | 'queue_item_deleted' // Queue item events
  | 'status_created' | 'status_updated' | 'status_deleted'
  | 'board_updated' | 'board_deleted';

export type SSEEvent = {
  type: SSEEventType;
  data: unknown;
  timestamp: string;
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
