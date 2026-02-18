/**
 * Batch Service
 * Business logic for batch operations
 */

import { db } from '../db/index.js';
import { queueBatches, queues, queueTemplates, queueTemplateStatuses, queueStatuses } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import type { NewQueueBatch } from '../db/schema.js';
import type { CreateBatchInput, UpdateBatchInput } from '../validators/batch.validator.js';

export class BatchService {
  /**
   * Get all batches with optional filtering
   */
  async getAllBatches(filters?: { queueId?: string; status?: 'active' | 'closed' }): Promise<typeof queueBatches.$inferSelect[]> {

    let batches: typeof queueBatches.$inferSelect[];

    if (filters?.queueId) {
      // Filter by queue
      if (filters.status) {
        batches = await db
          .select()
          .from(queueBatches)
          .where(and(eq(queueBatches.queueId, filters.queueId), eq(queueBatches.status, filters.status)))
          .orderBy(desc(queueBatches.createdAt));
      } else {
        batches = await db
          .select()
          .from(queueBatches)
          .where(eq(queueBatches.queueId, filters.queueId))
          .orderBy(desc(queueBatches.createdAt));
      }
    } else {
      // Get all batches
      batches = await db.select().from(queueBatches).orderBy(desc(queueBatches.createdAt));
    }

    return batches;
  }

  /**
   * Get statuses for a specific batch
   */
  async getBatchStatuses(batchId: string): Promise<Array<{
    id: string;
    label: string;
    color: string;
    order: number;
  }>> {
    const statuses = await db
      .select({
        id: queueStatuses.id,
        label: queueStatuses.label,
        color: queueStatuses.color,
        order: queueStatuses.order,
      })
      .from(queueStatuses)
      .where(eq(queueStatuses.queueId, batchId))
      .orderBy(queueStatuses.order);

    return statuses;
  }

  /**
   * Get a single batch by ID
   */
  async getBatchById(id: string): Promise<typeof queueBatches.$inferSelect | null> {
    const batches = await db.select().from(queueBatches).where(eq(queueBatches.id, id)).limit(1);
    return batches[0] || null;
  }

  /**
   * Create a new batch (copies statuses from template)
   */
  async createBatch(input: CreateBatchInput): Promise<typeof queueBatches.$inferSelect | null> {

    // Verify queue exists
    const queue = await db.select().from(queues).where(eq(queues.id, input.queueId)).limit(1);
    if (!queue || queue.length === 0) {
      return null;
    }

    // Get template for the queue
    const template = await db.select().from(queueTemplates).where(eq(queueTemplates.id, queue[0].templateId)).limit(1);

    // Create batch
    const newBatch: NewQueueBatch = {
      id: uuidv7(),
      templateId: queue[0].templateId,
      queueId: input.queueId,
      name: input.name || `Batch - ${new Date().toISOString()}`,
      status: input.status || 'active',
    };

    const batchResult = await db.insert(queueBatches).values(newBatch).returning();
    const batchId = batchResult[0].id;

    // Copy statuses from template
    if (template && template.length > 0) {
      const templateStatuses = await db
        .select()
        .from(queueTemplateStatuses)
        .where(eq(queueTemplateStatuses.templateId, queue[0].templateId))
        .orderBy(queueTemplateStatuses.order);

      // Create batch statuses as copies of template statuses
      const batchStatuses = templateStatuses.map((ts) => ({
        id: uuidv7(),
        queueId: batchId,
        templateStatusId: ts.id, // Track origin
        label: ts.label,
        color: ts.color,
        order: ts.order,
      }));

      if (batchStatuses.length > 0) {
        await db.insert(queueStatuses).values(batchStatuses);
      }
    }

    return batchResult[0];
  }

  /**
   * Update a batch
   */
  async updateBatch(id: string, input: UpdateBatchInput): Promise<typeof queueBatches.$inferSelect | null> {

    // Check if batch exists
    const existing = await db.select().from(queueBatches).where(eq(queueBatches.id, id)).limit(1);
    if (!existing || existing.length === 0) {
      return null;
    }

    // Build update object with only provided fields
    const updateData: Partial<NewQueueBatch> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.status !== undefined) updateData.status = input.status;

    const result = await db
      .update(queueBatches)
      .set(updateData)
      .where(eq(queueBatches.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Delete a batch
   */
  async deleteBatch(id: string): Promise<boolean> {

    // Check if batch exists
    const existing = await db.select().from(queueBatches).where(eq(queueBatches.id, id)).limit(1);
    if (!existing || existing.length === 0) {
      return false;
    }

    await db.delete(queueBatches).where(eq(queueBatches.id, id));
    return true;
  }
}

export const batchService = new BatchService();
