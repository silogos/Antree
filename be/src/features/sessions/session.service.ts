/**
 * Session Service
 * Business logic for session operations
 */

import { db } from '../../db/index.js';
import {
  queueSessions,
  queues,
  queueTemplates,
  queueTemplateStatuses,
  queueSessionStatuses,
} from '../../db/schema.js';
import { eq, and, desc, isNull, ne, sql } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import type {
  NewQueueSession,
  QueueSession,
  QueueSessionStatus,
} from '../../db/schema.js';
import type {
  CreateSessionInput,
  UpdateSessionInput,
} from './session.validator.js';
import type { SessionLifecycleDTO } from '../../types/session.dto.js';
import { sseBroadcaster } from '../../sse/broadcaster.js';
import type { PaginatedResponse, PaginationParams } from '../../lib/pagination.js';
import { calculatePaginationMetadata, getPaginationOffset } from '../../lib/pagination.js';

export class SessionService {
  /**
   * Get all sessions with optional filtering and pagination
   */
  async getAllSessions(
    filters?: {
      queueId?: string;
      status?: 'active' | 'paused' | 'completed' | 'archived';
      isDeleted?: boolean;
    },
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<typeof queueSessions.$inferSelect> | typeof queueSessions.$inferSelect[]> {
    // Default: exclude soft-deleted sessions
    const deletedCondition = isNull(queueSessions.deletedAt);

    const conditions: ReturnType<typeof eq | typeof and>[] = [deletedCondition];

    if (filters?.queueId) {
      conditions.push(eq(queueSessions.queueId, filters.queueId));
    }

    if (filters?.status) {
      conditions.push(eq(queueSessions.status, filters.status));
    }

    const whereClause = and(...conditions);

    // If pagination is requested, return paginated response
    if (pagination) {
      const page = pagination.page || 1;
      const limit = pagination.limit || 20;
      const offset = getPaginationOffset(page, limit);

      // Get total count
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(queueSessions)
        .where(whereClause);

      // Get paginated data
      const data = await db
        .select()
        .from(queueSessions)
        .where(whereClause)
        .orderBy(desc(queueSessions.createdAt))
        .limit(limit)
        .offset(offset);

      return {
        data,
        meta: calculatePaginationMetadata(count, page, limit),
      };
    }

    // Otherwise, return all sessions (backward compatibility)
    const sessions = await db
      .select()
      .from(queueSessions)
      .where(whereClause)
      .orderBy(desc(queueSessions.createdAt));

    return sessions;
  }

  /**
   * Get statuses for a specific session with optional pagination
   */
  async getSessionStatuses(
    sessionId: string,
    pagination?: PaginationParams
  ): Promise<PaginatedResponse<{
    id: string;
    label: string;
    color: string;
    order: number;
  }> | Array<{
    id: string;
    label: string;
    color: string;
    order: number;
  }>> {
    const whereClause = eq(queueSessionStatuses.sessionId, sessionId);

    // If pagination is requested, return paginated response
    if (pagination) {
      const page = pagination.page || 1;
      const limit = pagination.limit || 20;
      const offset = getPaginationOffset(page, limit);

      // Get total count
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(queueSessionStatuses)
        .where(whereClause);

      // Get paginated data
      const data = await db
        .select({
          id: queueSessionStatuses.id,
          label: queueSessionStatuses.label,
          color: queueSessionStatuses.color,
          order: queueSessionStatuses.order,
        })
        .from(queueSessionStatuses)
        .where(whereClause)
        .orderBy(queueSessionStatuses.order)
        .limit(limit)
        .offset(offset);

      return {
        data,
        meta: calculatePaginationMetadata(count, page, limit),
      };
    }

    // Otherwise, return all statuses (backward compatibility)
    const statuses = await db
      .select({
        id: queueSessionStatuses.id,
        label: queueSessionStatuses.label,
        color: queueSessionStatuses.color,
        order: queueSessionStatuses.order,
      })
      .from(queueSessionStatuses)
      .where(whereClause)
      .orderBy(queueSessionStatuses.order);

    return statuses;
  }

  /**
   * Get a single session by ID
   */
  async getSessionById(id: string): Promise<typeof queueSessions.$inferSelect | null> {
    const sessions = await db
      .select()
      .from(queueSessions)
      .where(eq(queueSessions.id, id))
      .limit(1);
    return sessions[0] || null;
  }

  /**
   * Validate lifecycle status transition
   */
  private validateStatusTransition(
    currentStatus: 'active' | 'paused' | 'completed' | 'archived',
    newStatus: 'active' | 'paused' | 'completed' | 'archived',
  ): boolean {
    // Valid transitions:
    // active <-> paused (can toggle)
    // active/paused -> completed
    // completed/paused -> archived
    // Cannot go backwards once completed or archived

    if (currentStatus === 'active') {
      return newStatus === 'paused' || newStatus === 'completed' || newStatus === 'archived';
    }

    if (currentStatus === 'paused') {
      return newStatus === 'active' || newStatus === 'completed' || newStatus === 'archived';
    }

    if (currentStatus === 'completed') {
      return newStatus === 'archived';
    }

    if (currentStatus === 'archived') {
      // Archived is final state
      return false;
    }

    return false;
  }

  /**
   * Check if queue already has an active session (excluding a specific session)
   */
  private async hasActiveSession(
    queueId: string,
    excludeSessionId?: string,
  ): Promise<boolean> {
    const conditions = and(
      eq(queueSessions.queueId, queueId),
      eq(queueSessions.status, 'active'),
      isNull(queueSessions.deletedAt),
    );

    // If excluding a session, add the condition
    let whereClause = conditions;
    if (excludeSessionId) {
      whereClause = and(
        conditions,
        ne(queueSessions.id, excludeSessionId),
      );
    }

    const activeSessions = await db
      .select()
      .from(queueSessions)
      .where(whereClause)
      .limit(1);

    return activeSessions.length > 0;
  }

  /**
   * Create a new session (copies statuses from template)
   */
  async createSession(
    input: CreateSessionInput,
  ): Promise<typeof queueSessions.$inferSelect | null> {
    // Verify queue exists
    const queue = await db
      .select()
      .from(queues)
      .where(eq(queues.id, input.queueId))
      .limit(1);

    if (!queue || queue.length === 0) {
      return null;
    }

    // If status is 'active', check if queue already has an active session
    if (input.status === 'active') {
      const hasActive = await this.hasActiveSession(input.queueId);
      if (hasActive) {
        return null;
      }
    }

    // Get template for the queue
    const template = await db
      .select()
      .from(queueTemplates)
      .where(eq(queueTemplates.id, queue[0].templateId))
      .limit(1);

    // Calculate next session number for this queue
    const maxSessionNumberResult = await db
      .select({ sessionNumber: queueSessions.sessionNumber })
      .from(queueSessions)
      .where(eq(queueSessions.queueId, input.queueId))
      .orderBy(desc(queueSessions.sessionNumber))
      .limit(1);

    const nextSessionNumber = maxSessionNumberResult[0]?.sessionNumber
      ? maxSessionNumberResult[0].sessionNumber + 1
      : 1;

    // Create session
    const newSession: NewQueueSession = {
      id: uuidv7(),
      templateId: queue[0].templateId,
      queueId: input.queueId,
      name: input.name || `Session ${nextSessionNumber}`,
      status: input.status || 'active',
      sessionNumber: nextSessionNumber,
    };

    const sessionResult = await db
      .insert(queueSessions)
      .values(newSession)
      .returning();
    const sessionId = sessionResult[0].id;

    // Copy statuses from template
    if (template && template.length > 0) {
      const templateStatuses = await db
        .select()
        .from(queueTemplateStatuses)
        .where(eq(queueTemplateStatuses.templateId, queue[0].templateId))
        .orderBy(queueTemplateStatuses.order);

      // Create session statuses as copies of template statuses
      const sessionStatuses = templateStatuses.map((ts) => ({
        id: uuidv7(),
        sessionId: sessionId,
        templateStatusId: ts.id, // Track origin
        label: ts.label,
        color: ts.color,
        order: ts.order,
      }));

      if (sessionStatuses.length > 0) {
        await db.insert(queueSessionStatuses).values(sessionStatuses);
      }
    }

    return sessionResult[0];
  }

  /**
   * Update a session
   */
  async updateSession(
    id: string,
    input: UpdateSessionInput,
  ): Promise<typeof queueSessions.$inferSelect | null> {
    // Check if session exists
    const existing = await db
      .select()
      .from(queueSessions)
      .where(eq(queueSessions.id, id))
      .limit(1);

    if (!existing || existing.length === 0) {
      return null;
    }

    const session = existing[0];

    // If status is being updated, validate the transition
    if (input.status !== undefined && input.status !== session.status) {
      const isValidTransition = this.validateStatusTransition(
        session.status as 'active' | 'paused' | 'completed' | 'archived',
        input.status,
      );

      if (!isValidTransition) {
        return null;
      }

      // If transitioning to 'active', check for existing active session
      // Only block if this is a NEW activation (from draft/completed), not a resume from paused
      if (input.status === 'active' && session.status !== 'paused') {
        if (!session.queueId) {
          return null;
        }
        const hasActive = await this.hasActiveSession(session.queueId, id);
        if (hasActive) {
          return null;
        }
      }
    }

    // Build update object with only provided fields
    const updateData: Partial<NewQueueSession> = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.status !== undefined) updateData.status = input.status;

    // Set timestamps based on lifecycle
    if (input.status === 'active' && !session.startedAt) {
      // Starting session
      updateData.startedAt = new Date();
    }

    if (input.status === 'completed' && !session.endedAt) {
      // Completing session
      updateData.endedAt = new Date();
    }

    if (input.status === 'archived' && !session.endedAt) {
      // Archiving the session
      updateData.endedAt = new Date();
    }

    const result = await db
      .update(queueSessions)
      .set(updateData)
      .where(eq(queueSessions.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Delete a session (soft delete)
   */
  async deleteSession(id: string): Promise<boolean> {
    // Check if session exists
    const existing = await db
      .select()
      .from(queueSessions)
      .where(eq(queueSessions.id, id))
      .limit(1);

    if (!existing || existing.length === 0) {
      return false;
    }

    const session = existing[0];

    // Soft delete: set deleted_at
    await db
      .update(queueSessions)
      .set({ deletedAt: new Date() })
      .where(eq(queueSessions.id, id));

    // Broadcast session_deleted event
    sseBroadcaster.broadcast({
      type: 'session_deleted',
      data: {
        id: session.id,
        queue_id: session.queueId ?? undefined,
      },
      sessionId: session.id,
      queueId: session.queueId ?? undefined,
    });

    return true;
  }

  /**
   * Broadcast session_created event
   */
  broadcastSessionCreated(session: QueueSession): void {
    sseBroadcaster.broadcast({
      type: 'session_created',
      data: {
        id: session.id,
        queue_id: session.queueId ?? undefined,
        template_id: session.templateId,
        name: session.name,
        status: session.status as 'draft' | 'active' | 'paused' | 'completed' | 'archived',
        session_number: session.sessionNumber,
        started_at: session.startedAt ? session.startedAt.toISOString() : undefined,
        ended_at: session.endedAt ? session.endedAt.toISOString() : undefined,
        created_at: session.createdAt.toISOString(),
      },
      sessionId: session.id,
      queueId: session.queueId ?? undefined,
    });
  }

  /**
   * Broadcast session_updated event
   */
  broadcastSessionUpdated(session: QueueSession): void {
    sseBroadcaster.broadcast({
      type: 'session_updated',
      data: {
        id: session.id,
        queue_id: session.queueId ?? undefined,
        template_id: session.templateId,
        name: session.name,
        status: session.status as 'draft' | 'active' | 'paused' | 'completed' | 'archived',
        session_number: session.sessionNumber,
        started_at: session.startedAt ? session.startedAt.toISOString() : undefined,
        ended_at: session.endedAt ? session.endedAt.toISOString() : undefined,
        created_at: session.createdAt.toISOString(),
      },
      sessionId: session.id,
      queueId: session.queueId ?? undefined,
    });
  }

  /**
   * Broadcast session_completed event (when status changes to 'completed')
   */
  broadcastSessionCompleted(session: QueueSession): void {
    sseBroadcaster.broadcast({
      type: 'session_completed',
      data: {
        id: session.id,
        queue_id: session.queueId ?? undefined,
        template_id: session.templateId,
        name: session.name,
        status: 'completed' as const,
        session_number: session.sessionNumber,
        started_at: session.startedAt ? session.startedAt.toISOString() : undefined,
        ended_at: session.endedAt ? session.endedAt.toISOString() : undefined,
        created_at: session.createdAt.toISOString(),
      },
      sessionId: session.id,
      queueId: session.queueId ?? undefined,
    });
  }

  /**
   * Broadcast session_status_created event
   */
  broadcastSessionStatusCreated(status: QueueSessionStatus): void {
    sseBroadcaster.broadcast({
      type: 'session_status_created',
      data: {
        id: status.id,
        session_id: status.sessionId,
        label: status.label,
        color: status.color,
        order: status.order,
      },
      sessionId: status.sessionId,
    });
  }

  /**
   * Broadcast session_status_updated event
   */
  broadcastSessionStatusUpdated(status: QueueSessionStatus): void {
    sseBroadcaster.broadcast({
      type: 'session_status_updated',
      data: {
        id: status.id,
        session_id: status.sessionId,
        label: status.label,
        color: status.color,
        order: status.order,
      },
      sessionId: status.sessionId,
    });
  }

  /**
   * Broadcast session_status_deleted event
   */
  broadcastSessionStatusDeleted(statusId: string, sessionId: string): void {
    sseBroadcaster.broadcast({
      type: 'session_status_deleted',
      data: {
        id: statusId,
        session_id: sessionId,
      },
      sessionId: sessionId,
    });
  }
}

export const sessionService = new SessionService();
