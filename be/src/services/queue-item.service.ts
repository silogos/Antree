/**
 * Queue Item Service
 * Business logic for queue item operations
 */

import { getDb } from '../db/index.js';
import { queueItems } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import type { NewQueueItem, QueueItem } from '../db/schema.js';
import type { CreateQueueItemInput, UpdateQueueItemInput } from '../validators/queue-item.validator.js';

export class QueueItemService {
  /**
   * Get all queue items with optional filtering
   */
  async getAllQueueItems(filters?: { queueId?: string; statusId?: string }): Promise<QueueItem[]> {
    const db = getDb();

    const conditions: (ReturnType<typeof eq>)[] = [];
    if (filters?.queueId) {
      conditions.push(eq(queueItems.queueId, filters.queueId));
    }
    if (filters?.statusId) {
      conditions.push(eq(queueItems.statusId, filters.statusId));
    }

    let items: QueueItem[];
    if (conditions.length > 0) {
      items = await db
        .select()
        .from(queueItems)
        .where(conditions.length === 1 ? conditions[0] : and(...conditions))
        .orderBy(queueItems.createdAt);
    } else {
      items = await db.select().from(queueItems).orderBy(queueItems.createdAt);
    }

    return items;
  }

  /**
   * Get a single queue item by ID
   */
  async getQueueItemById(id: string): Promise<QueueItem | null> {
    const db = getDb();
    const items = await db.select().from(queueItems).where(eq(queueItems.id, id)).limit(1);
    return items[0] || null;
  }

  /**
   * Create a new queue item
   */
  async createQueueItem(input: CreateQueueItemInput): Promise<QueueItem> {
    const db = getDb();
    const newItem: NewQueueItem = {
      id: uuidv4(),
      queueId: input.queueId,
      queueNumber: input.queueNumber,
      name: input.name,
      statusId: input.statusId,
      metadata: input.metadata || null,
    };

    const result = await db.insert(queueItems).values(newItem).returning();
    return result[0];
  }

  /**
   * Update a queue item
   */
  async updateQueueItem(id: string, input: UpdateQueueItemInput): Promise<QueueItem | null> {
    const db = getDb();

    // Check if item exists
    const existing = await db.select().from(queueItems).where(eq(queueItems.id, id)).limit(1);
    if (!existing || existing.length === 0) {
      return null;
    }

    // Build update object with only provided fields
    const updateData: Partial<NewQueueItem> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.statusId !== undefined) updateData.statusId = input.statusId;
    if (input.metadata !== undefined) updateData.metadata = input.metadata;

    const result = await db
      .update(queueItems)
      .set(updateData)
      .where(eq(queueItems.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Delete a queue item
   */
  async deleteQueueItem(id: string): Promise<boolean> {
    const db = getDb();

    // Check if item exists
    const existing = await db.select().from(queueItems).where(eq(queueItems.id, id)).limit(1);
    if (!existing || existing.length === 0) {
      return false;
    }

    await db.delete(queueItems).where(eq(queueItems.id, id));
    return true;
  }
}

export const queueItemService = new QueueItemService();
