/**
 * Type definitions for queue, session, template, and status entities
 * These are TypeScript interfaces for runtime use, matching the backend API contract
 */

/**
 * Queue Template - Represents a template for queue sessions
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
 * Queue Item - Represents a single customer in queue
 * Matches backend schema
 */
export interface QueueItem {
  id: string;
  queueId: string;
  sessionId: string;
  queueNumber: string;
  name: string;
  statusId: string;
  createdAt: string;
  updatedAt: string;
  /** Optional custom data (JSONB) stored with queue item */
  metadata?: Record<string, unknown> | null;
}

/**
 * Queue Session Status - Represents a status for queue items in a session
 * Matches backend schema
 */
export interface QueueSessionStatus {
  id: string;
  sessionId: string;
  templateStatusId?: string | null;
  label: string;
  color: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Queue Template Status - Represents a status in a template
 * Matches backend schema
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
 * Queue Status - Represents a status for queue items
 * @deprecated Use QueueSessionStatus instead
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
 * Queue - Represents a queue created by user
 * Matches backend schema
 */
export interface Queue {
  id: string;
  name: string;
  templateId: string;
  createdBy?: string | null;
  updatedBy?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Queue Session Status Enum
 * Matches backend schema status values
 */
export enum SessionStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  PAUSED = "paused",
  COMPLETED = "completed",
  ARCHIVED = "archived",
}

/**
 * Session Lifecycle Enum
 * @deprecated Use SessionStatus instead
 */
export enum SessionLifecycle {
  DRAFT = "draft",
  ACTIVE = "active",
  PAUSED = "paused",
  COMPLETED = "completed",
  ARCHIVED = "archived",
  CLOSED = "closed",
}

/**
 * Queue Session - Represents a session of a queue
 * Matches backend schema
 */
export interface QueueSession {
  id: string;
  templateId: string;
  queueId: string;
  name: string;
  status: SessionStatus;
  sessionNumber?: number | null;
  startedAt?: string | null;
  endedAt?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Session Lifecycle DTO for API
 */
export interface SessionLifecycleDTO {
  status: SessionStatus;
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
 * Create Queue Input - Input for creating a new queue
 */
export interface CreateQueueInput {
  name: string;
  templateId: string;
}

/**
 * Update Queue Input - Input for updating an existing queue
 */
export interface UpdateQueueInput {
  id: string;
  name?: string;
  isActive?: boolean;
}

/**
 * Create Session Input - Input for creating a new session
 */
export interface CreateSessionInput {
  queueId: string;
  name?: string;
}

/**
 * Update Session Input - Input for updating an existing session
 */
export interface UpdateSessionInput {
  id: string;
  name?: string;
}

/**
 * Create Queue Item Input - Input for creating a new queue item
 */
export interface CreateQueueItemInput {
  queueId: string;
  sessionId: string;
  queueNumber: string;
  name: string;
  statusId: string;
  metadata?: Record<string, unknown> | null;
}

/**
 * Update Queue Item Input - Input for updating an existing queue item
 */
export interface UpdateQueueItemInput {
  id: string;
  name?: string;
  statusId?: string;
  metadata?: Record<string, unknown> | null;
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
  | "connected"
  | "queue_created"
  | "queue_updated"
  | "queue_deleted" // Queue events (for queue management, not queue items)
  | "session_created"
  | "session_updated"
  | "session_deleted"
  | "session_paused"
  | "session_resumed"
  | "session_completed"
  | "session_archived"
  | "session_closed" // Session events
  | "queue_item_created"
  | "queue_item_updated"
  | "queue_item_status_changed"
  | "queue_item_deleted" // Queue item events
  | "session_status_created"
  | "session_status_updated"
  | "session_status_deleted" // Session status events
  | "template_created"
  | "template_updated"
  | "template_deleted" // Template events
  | "status_created"
  | "status_updated"
  | "status_deleted"; // Status events (legacy, for backward compatibility)

/**
 * SSE Event - Server-Sent Event payload
 */
export interface SSEEvent<T = unknown> {
  type: SSEEventType;
  data: T;
  timestamp: string;
}
