/**
 * DTO types for session-based queue API responses
 * All properties use camelCase for consistency with modern JSON APIs
 */

/**
 * Queue DTO - represents a queue in the system
 * Queues are permanent dashboards, sessions represent runtime periods
 */
export interface QueueDTO {
  id: string;
  name: string;
  templateId: string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Session DTO - represents a session within a queue
 * Sessions are runtime periods with lifecycle states
 */
export interface SessionDTO {
  id: string;
  queueId: string;
  templateId: string;
  name: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  sessionNumber: number;
  startedAt: Date | string | null;
  endedAt: Date | string | null;
  createdAt: Date | string;
}

/**
 * SessionStatus DTO - represents a status within a session
 * Statuses define the stages in a queue session
 */
export interface SessionStatusDTO {
  id: string;
  sessionId: string;
  label: string;
  color: string;
  order: number;
}

/**
 * QueueItem DTO - represents a queue item within a session
 * Items are people in the queue with their status
 */
export interface QueueItemDTO {
  id: string;
  queueId: string;
  sessionId: string;
  statusId: string;
  queueNumber: string;
  displayName: string;
  metadata: any;
  createdAt: Date | string;
}

/**
 * Template DTO - represents a queue template
 * Templates define default queues with predefined statuses
 */
export interface TemplateDTO {
  id: string;
  name: string;
  description: string;
  isSystemTemplate: boolean;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * TemplateStatus DTO - represents a status within a template
 * Template statuses are used when creating queues from templates
 */
export interface TemplateStatusDTO {
  id: string;
  templateId: string;
  label: string;
  color: string;
  order: number;
}

/**
 * SessionLifecycle DTO - represents the lifecycle state of a session
 * Used for PATCH /sessions/:id/lifecycle endpoint
 */
export interface SessionLifecycleDTO {
  status: 'active' | 'paused' | 'completed' | 'archived';
}
