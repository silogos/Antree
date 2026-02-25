/**
 * Status Service
 * Business logic for status operations
 */

import { eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { db } from "../../db/index.js";
import type { NewQueueSessionStatus } from "../../db/schema.js";
import { queueSessionStatuses } from "../../db/schema.js";
import { getDatabaseErrorMessage } from "../../middleware/error.middleware.js";
import { sseBroadcaster } from "../../sse/broadcaster.js";
import type { CreateStatusInput, UpdateStatusInput } from "./status.validator.js";

export class StatusService {
  /**
   * Get all statuses for a session
   */
  async getAllStatuses(
    sessionId: string
  ): Promise<(typeof queueSessionStatuses.$inferSelect)[] | null> {
    if (!sessionId) {
      return null;
    }

    return db
      .select()
      .from(queueSessionStatuses)
      .where(eq(queueSessionStatuses.sessionId, sessionId))
      .orderBy(queueSessionStatuses.order);
  }

  /**
   * Get a single status by ID
   */
  async getStatusById(id: string): Promise<typeof queueSessionStatuses.$inferSelect | null> {
    const statuses = await db
      .select()
      .from(queueSessionStatuses)
      .where(eq(queueSessionStatuses.id, id))
      .limit(1);
    return statuses[0] || null;
  }

  /**
   * Create a new status
   */
  async createStatus(input: CreateStatusInput): Promise<typeof queueSessionStatuses.$inferSelect> {
    const newStatus: NewQueueSessionStatus = {
      id: uuidv7(),
      sessionId: input.sessionId,
      templateStatusId: input.templateStatusId || null,
      label: input.label,
      color: input.color,
      order: input.order,
    };

    const result = await db.insert(queueSessionStatuses).values(newStatus).returning();

    // Broadcast session_status_created event
    this.broadcastSessionStatusCreated(result[0]);

    return result[0];
  }

  /**
   * Update a status
   */
  async updateStatus(
    id: string,
    input: UpdateStatusInput
  ): Promise<typeof queueSessionStatuses.$inferSelect | null> {
    // Check if status exists
    const existing = await this.getStatusById(id);
    if (!existing) {
      return null;
    }

    // Build update object with only provided fields
    const updateData: Partial<NewQueueSessionStatus> = {};
    if (input.label !== undefined) updateData.label = input.label;
    if (input.color !== undefined) updateData.color = input.color;
    if (input.order !== undefined) updateData.order = input.order;
    if (input.templateStatusId !== undefined) updateData.templateStatusId = input.templateStatusId;

    const result = await db
      .update(queueSessionStatuses)
      .set(updateData)
      .where(eq(queueSessionStatuses.id, id))
      .returning();

    // Broadcast session_status_updated event
    if (result[0]) {
      this.broadcastSessionStatusUpdated(result[0]);
    }

    return result[0] || null;
  }

  /**
   * Delete a status
   * @throws Error if foreign key constraint violation
   */
  async deleteStatus(id: string): Promise<{ success: boolean; error?: string }> {
    // Check if status exists
    const existing = await this.getStatusById(id);
    if (!existing) {
      return { success: false, error: "Status not found" };
    }

    const sessionId = existing.sessionId;

    try {
      await db.delete(queueSessionStatuses).where(eq(queueSessionStatuses.id, id));

      // Broadcast session_status_deleted event
      this.broadcastSessionStatusDeleted(id, sessionId);

      return { success: true };
    } catch (error) {
      // Check if it's a foreign key constraint error
      if (
        getDatabaseErrorMessage(error) ===
        "This record is referenced by other records and cannot be deleted"
      ) {
        return {
          success: false,
          error: `Cannot delete status with id ${id} because it is referenced by one or more sessions`,
        };
      }
      throw error;
    }
  }

  /**
   * Broadcast session_status_created event
   */
  broadcastSessionStatusCreated(status: typeof queueSessionStatuses.$inferSelect): void {
    sseBroadcaster.broadcast({
      type: "session_status_created",
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
  broadcastSessionStatusUpdated(status: typeof queueSessionStatuses.$inferSelect): void {
    sseBroadcaster.broadcast({
      type: "session_status_updated",
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
      type: "session_status_deleted",
      data: {
        id: statusId,
        session_id: sessionId,
      },
      sessionId: sessionId,
    });
  }
}

export const statusService = new StatusService();
