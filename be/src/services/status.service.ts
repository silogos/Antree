/**
 * Status Service
 * Business logic for status operations
 */

import { getDb } from '../db/index.js';
import { queueStatuses } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import type { NewQueueStatus } from '../db/schema.js';
import type { CreateStatusInput, UpdateStatusInput } from '../validators/status.validator.js';
import { getDatabaseErrorMessage } from '../middleware/error.js';

export class StatusService {
  /**
   * Get all statuses for a batch
   */
  async getAllStatuses(queueId: string): Promise<typeof queueStatuses.$inferSelect[] | null> {
    if (!queueId) {
      return null;
    }

    const db = getDb();
    return db
      .select()
      .from(queueStatuses)
      .where(eq(queueStatuses.queueId, queueId))
      .orderBy(queueStatuses.order);
  }

  /**
   * Get a single status by ID
   */
  async getStatusById(id: string): Promise<typeof queueStatuses.$inferSelect | null> {
    const db = getDb();
    const statuses = await db.select().from(queueStatuses).where(eq(queueStatuses.id, id)).limit(1);
    return statuses[0] || null;
  }

  /**
   * Create a new status
   */
  async createStatus(input: CreateStatusInput): Promise<typeof queueStatuses.$inferSelect> {
    const db = getDb();
    const newStatus: NewQueueStatus = {
      id: uuidv4(),
      queueId: input.queueId,
      templateStatusId: input.templateStatusId || null,
      label: input.label,
      color: input.color,
      order: input.order,
    };

    const result = await db.insert(queueStatuses).values(newStatus).returning();
    return result[0];
  }

  /**
   * Update a status
   */
  async updateStatus(id: string, input: UpdateStatusInput): Promise<typeof queueStatuses.$inferSelect | null> {
    const db = getDb();

    // Check if status exists
    const existing = await this.getStatusById(id);
    if (!existing) {
      return null;
    }

    // Build update object with only provided fields
    const updateData: Partial<NewQueueStatus> = {};
    if (input.label !== undefined) updateData.label = input.label;
    if (input.color !== undefined) updateData.color = input.color;
    if (input.order !== undefined) updateData.order = input.order;
    if (input.templateStatusId !== undefined) updateData.templateStatusId = input.templateStatusId;

    const result = await db
      .update(queueStatuses)
      .set(updateData)
      .where(eq(queueStatuses.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Delete a status
   * @throws Error if foreign key constraint violation
   */
  async deleteStatus(id: string): Promise<{ success: boolean; error?: string }> {
    const db = getDb();

    // Check if status exists
    const existing = await this.getStatusById(id);
    if (!existing) {
      return { success: false, error: 'Status not found' };
    }

    try {
      await db.delete(queueStatuses).where(eq(queueStatuses.id, id));
      return { success: true };
    } catch (error) {
      // Check if it's a foreign key constraint error
      if (getDatabaseErrorMessage(error) === 'This record is referenced by other records and cannot be deleted') {
        return {
          success: false,
          error: `Cannot delete status with id ${id} because it is referenced by one or more queues`
        };
      }
      throw error;
    }
  }
}

export const statusService = new StatusService();
