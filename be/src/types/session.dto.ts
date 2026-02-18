/**
 * DTO types for session-based queue API responses
 * All properties use snake_case per user preference (from Task 4)
 */

/**
 * Queue DTO - represents a queue in the system
 * Queues are permanent dashboards, sessions represent runtime periods
 */
export interface QueueDTO {
  id: string;
  name: string;
  template_id: string;
  is_active: boolean;
  created_at: Date | string;
  updated_at: Date | string;
}

/**
 * Session DTO - represents a session within a queue
 * Sessions are runtime periods with lifecycle states
 */
export interface SessionDTO {
  id: string;
  queue_id: string;
  template_id: string;
  name: string;
  status: 'draft' | 'active' | 'closed';
  session_number: number;
  started_at: Date | string | null;
  ended_at: Date | string | null;
  created_at: Date | string;
}

/**
 * SessionStatus DTO - represents a status within a session
 * Statuses define the stages in a queue session
 */
export interface SessionStatusDTO {
  id: string;
  session_id: string;
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
  queue_id: string;
  session_id: string;
  status_id: string;
  queue_number: string;
  name: string;
  metadata: any;
  created_at: Date | string;
}

/**
 * Template DTO - represents a queue template
 * Templates define default queues with predefined statuses
 */
export interface TemplateDTO {
  id: string;
  name: string;
  description: string;
  is_system_template: boolean;
  is_active: boolean;
  created_at: Date | string;
  updated_at: Date | string;
}

/**
 * TemplateStatus DTO - represents a status within a template
 * Template statuses are used when creating queues from templates
 */
export interface TemplateStatusDTO {
  id: string;
  template_id: string;
  label: string;
  color: string;
  order: number;
}

/**
 * SessionLifecycle DTO - represents the lifecycle state of a session
 * Used for PATCH /sessions/:id/lifecycle endpoint
 */
export interface SessionLifecycleDTO {
  status: 'draft' | 'active' | 'closed';
}
