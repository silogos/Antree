/**
 * Queue Item Service
 * Business logic for queue item operations
 */

import { db } from '../db/index.js';
import { queueItems } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import type { NewQueueItem, QueueItem } from '../db/schema.js';
import type { CreateQueueItemInput, UpdateQueueItemInput } from '../validators/queue-item.validator.js';
import { sseBroadcaster } from '../sse/broadcaster.js';

export class QueueItemService {
  /**
   * Get all queue items with optional filtering
   */
  async getAllQueueItems(filters?: { queueId?: string; sessionId?: string; statusId?: string }): Promise<QueueItem[]> {

    const conditions: (ReturnType<typeof eq>)[] = [];
    if (filters?.queueId) {
      conditions.push(eq(queueItems.queueId, filters.queueId));
    }
    if (filters?.sessionId) {
      conditions.push(eq(queueItems.sessionId, filters.sessionId));
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
    const items = await db.select().from(queueItems).where(eq(queueItems.id, id)).limit(1);
    return items[0] || null;
  }

  /**
   * Create a new queue item
   */
  async createQueueItem(input: CreateQueueItemInput): Promise<QueueItem> {
    const newItem: NewQueueItem = {
      id: uuidv7(),
      queueId: input.queueId,
      sessionId: input.sessionId,
      queueNumber: input.queueNumber,
      name: input.name,
      statusId: input.statusId,
      metadata: input.metadata || null,
    };

    const result = await db.insert(queueItems).values(newItem).returning();

    // Broadcast item_created event
    this.broadcastItemCreated(result[0]);

    return result[0];
  }

  /**
   * Update a queue item
   */
  async updateQueueItem(id: string, input: UpdateQueueItemInput): Promise<QueueItem | null> {

    // Check if item exists
    const existing = await db.select().from(queueItems).where(eq(queueItems.id, id)).limit(1);
    if (!existing || existing.length === 0) {
      return null;
    }

    const oldItem = existing[0];

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

    if (result[0]) {
      // Broadcast appropriate event based on what changed
      if (input.statusId !== undefined && input.statusId !== oldItem.statusId) {
        // Status changed - broadcast item_status_changed
        this.broadcastItemStatusChanged(result[0]);
      } else {
        // Other metadata changed - broadcast item_updated
        this.broadcastItemUpdated(result[0]);
      }
    }

    return result[0] || null;
  }

  /**
   * Delete a queue item
   */
  async deleteQueueItem(id: string): Promise<boolean> {

    // Check if item exists
    const existing = await db.select().from(queueItems).where(eq(queueItems.id, id)).limit(1);
    if (!existing || existing.length === 0) {
      return false;
    }

    const item = existing[0];

    await db.delete(queueItems).where(eq(queueItems.id, id));

    // Broadcast item_deleted event
    this.broadcastItemDeleted(item);

    return true;
  }

  /**
   * Broadcast item_created event
   */
  broadcastItemCreated(item: QueueItem): void {
    sseBroadcaster.broadcast({
      type: 'item_created',
      data: {
        id: item.id,
        queue_id: item.queueId,
        session_id: item.sessionId,
        status_id: item.statusId,
        queue_number: item.queueNumber,
        name: item.name,
        metadata: item.metadata || undefined,
        created_at: item.createdAt.toISOString(),
      },
      sessionId: item.sessionId,
      queueId: item.queueId,
    });
  }

  /**
   * Broadcast item_updated event
   */
  broadcastItemUpdated(item: QueueItem): void {
    sseBroadcaster.broadcast({
      type: 'item_updated',
      data: {
        id: item.id,
        queue_id: item.queueId,
        session_id: item.sessionId,
        status_id: item.statusId,
        queue_number: item.queueNumber,
        name: item.name,
        metadata: item.metadata || undefined,
        created_at: item.createdAt.toISOString(),
      },
      sessionId: item.sessionId,
      queueId: item.queueId,
    });
  }

  /**
   * Broadcast item_status_changed event
   */
  broadcastItemStatusChanged(item: QueueItem): void {
    sseBroadcaster.broadcast({
      type: 'item_status_changed',
      data: {
        id: item.id,
        queue_id: item.queueId,
        session_id: item.sessionId,
        status_id: item.statusId,
        queue_number: item.queueNumber,
        name: item.name,
        metadata: item.metadata || undefined,
        created_at: item.createdAt.toISOString(),
      },
      sessionId: item.sessionId,
      queueId: item.queueId,
    });
  }

  /**
   * Broadcast item_deleted event
   */
  broadcastItemDeleted(item: QueueItem): void {
    sseBroadcaster.broadcast({
      type: 'item_deleted',
      data: {
        id: item.id,
        queue_id: item.queueId,
        session_id: item.sessionId,
      },
      sessionId: item.sessionId,
      queueId: item.queueId,
    });
  }
}

export const queueItemService = new QueueItemService();
