/**
 * Queue Service
 * Business logic for queue operations (template-based queues)
 */

import { db } from '../db/index.js';
import { queues, queueBatches, queueTemplates, queueTemplateStatuses, queueStatuses } from '../db/schema.js';
import { eq, desc, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import type { NewQueue, Queue, QueueBatch } from '../db/schema.js';
import type { CreateQueueInput, UpdateQueueInput, ResetQueueInput } from '../validators/queue.validator.js';

export class QueueService {
  /**
   * Get all queues
   */
  async getAllQueues(): Promise<Queue[]> {
    return db.select().from(queues).orderBy(desc(queues.createdAt));
  }

  /**
   * Get a single queue by ID with active batch information
   */
  async getQueueById(id: string): Promise<(Queue & { activeBatchId: string | null; activeBatch: QueueBatch | null }) | null> {
    const queue = await db.select().from(queues).where(eq(queues.id, id)).limit(1);

    if (!queue || queue.length === 0) {
      return null;
    }

    // Get active batch for this queue
    const activeBatch = await db
      .select()
      .from(queueBatches)
      .where(and(eq(queueBatches.queueId, id), eq(queueBatches.status, 'active')))
      .limit(1);

    return {
      ...queue[0],
      activeBatchId: activeBatch && activeBatch.length > 0 ? activeBatch[0].id : null,
      activeBatch: activeBatch && activeBatch.length > 0 ? activeBatch[0] : null,
    };
  }

  /**
   * Get active batch for a queue with its statuses
   */
  async getActiveBatch(queueId: string): Promise<{ batch: QueueBatch; statuses: typeof queueStatuses.$inferSelect[] } | null> {

    // Verify queue exists
    const queue = await db.select().from(queues).where(eq(queues.id, queueId)).limit(1);
    if (!queue || queue.length === 0) {
      return null;
    }

    // Get active batch
    const activeBatch = await db
      .select()
      .from(queueBatches)
      .where(and(eq(queueBatches.queueId, queueId), eq(queueBatches.status, 'active')))
      .limit(1);

    if (!activeBatch || activeBatch.length === 0) {
      return null;
    }

    // Get statuses for the batch
    const statuses = await db
      .select()
      .from(queueStatuses)
      .where(eq(queueStatuses.queueId, activeBatch[0].id))
      .orderBy(queueStatuses.order);

    return {
      batch: activeBatch[0],
      statuses,
    };
  }

  /**
   * Create a new queue
   */
  async createQueue(input: CreateQueueInput): Promise<Queue | null> {

    // Verify template exists
    const template = await db.select().from(queueTemplates).where(eq(queueTemplates.id, input.templateId)).limit(1);
    if (!template || template.length === 0) {
      return null;
    }

    const newQueue: NewQueue = {
      id: uuidv4(),
      name: input.name,
      templateId: input.templateId,
      createdBy: input.createdBy || null,
      updatedBy: input.updatedBy || null,
      isActive: input.isActive !== undefined ? input.isActive : true,
    };

    const result = await db.insert(queues).values(newQueue).returning();
    return result[0] || null;
  }

  /**
   * Update a queue
   */
  async updateQueue(id: string, input: UpdateQueueInput): Promise<Queue | null> {

    // Check if queue exists
    const existing = await db.select().from(queues).where(eq(queues.id, id)).limit(1);
    if (!existing || existing.length === 0) {
      return null;
    }

    // Build update object with only provided fields
    const updateData: Partial<NewQueue> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;
    if (input.updatedBy !== undefined) updateData.updatedBy = input.updatedBy;

    const result = await db
      .update(queues)
      .set(updateData)
      .where(eq(queues.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Delete a queue (cascades to batches, statuses, items)
   */
  async deleteQueue(id: string): Promise<boolean> {

    // Check if queue exists
    const existing = await db.select().from(queues).where(eq(queues.id, id)).limit(1);
    if (!existing || existing.length === 0) {
      return false;
    }

    await db.delete(queues).where(eq(queues.id, id));
    return true;
  }

  /**
   * Reset queue by closing current active batch and creating a new one
   */
  async resetQueue(id: string, input: ResetQueueInput = {}): Promise<QueueBatch | null> {

    // Verify queue exists
    const queue = await db.select().from(queues).where(eq(queues.id, id)).limit(1);
    if (!queue || queue.length === 0) {
      return null;
    }

    // Get template for the queue
    const template = await db.select().from(queueTemplates).where(eq(queueTemplates.id, queue[0].templateId)).limit(1);

    // Close current active batch if exists
    const currentActiveBatch = await db
      .select()
      .from(queueBatches)
      .where(and(eq(queueBatches.queueId, id), eq(queueBatches.status, 'active')))
      .limit(1);

    if (currentActiveBatch && currentActiveBatch.length > 0) {
      await db
        .update(queueBatches)
        .set({ status: 'closed' })
        .where(eq(queueBatches.id, currentActiveBatch[0].id));
    }

    // Create new batch
    const newBatch = {
      id: uuidv4(),
      queueId: id,
      name: input.name || `Batch - ${new Date().toISOString()}`,
      status: 'active' as const,
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

      const batchStatuses = templateStatuses.map((ts) => ({
        id: uuidv4(),
        queueId: batchId,
        templateStatusId: ts.id,
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
}

export const queueService = new QueueService();
