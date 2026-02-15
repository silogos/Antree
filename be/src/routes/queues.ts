import { Hono } from 'hono';
import { getDb } from '../db/index.js';
import { queueItems } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { sseBroadcaster } from '../sse/broadcaster.js';

export const queueRoutes = new Hono();

/**
 * GET /queues
 * Get all queue items. Optionally filter by board or status.
 */
queueRoutes.get('/', async (c) => {
  try {
    const boardId = c.req.query('boardId');
    const statusId = c.req.query('statusId');

    const db = getDb();

    let conditions = [];
    if (boardId) {
      conditions.push(eq(queueItems.boardId, boardId));
    }
    if (statusId) {
      conditions.push(eq(queueItems.statusId, statusId));
    }

    let queues;
    if (conditions.length > 0) {
      queues = await db
        .select()
        .from(queueItems)
        .where(conditions.length === 1 ? conditions[0] : and(...conditions))
        .orderBy(queueItems.createdAt);
    } else {
      queues = await db.select().from(queueItems).orderBy(queueItems.createdAt);
    }

    return c.json({
      success: true,
      data: queues,
      total: queues.length
    });
  } catch (error) {
    console.error('[QueueRoutes] GET /queues error:', error);
    return c.json({
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * GET /queues/:id
 * Get a single queue item by ID
 */
queueRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const db = getDb();
    const queue = await db.select().from(queueItems).where(eq(queueItems.id, id)).limit(1);

    if (!queue || queue.length === 0) {
      return c.json({
        success: false,
        error: 'Not Found',
        message: `Queue with id ${id} not found`
      }, 404);
    }

    return c.json({
      success: true,
      data: queue[0]
    });
  } catch (error) {
    console.error('[QueueRoutes] GET /queues/:id error:', error);
    return c.json({
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * POST /queues
 * Create a new queue item
 */
queueRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json();

    // Validation
    if (!body.boardId || !body.queueNumber || !body.name || !body.statusId) {
      return c.json({
        success: false,
        error: 'Validation Error',
        message: 'boardId, queueNumber, name, and statusId are required'
      }, 400);
    }

    const db = getDb();
    const newQueue = {
      id: uuidv4(),
      boardId: body.boardId,
      queueNumber: body.queueNumber,
      name: body.name,
      statusId: body.statusId,
      metadata: body.metadata || null,
    };

    const result = await db.insert(queueItems).values(newQueue).returning();

    // Broadcast SSE event
    sseBroadcaster.broadcast({
      type: 'queue_created',
      data: result[0],
      boardId: body.boardId
    });

    return c.json({
      success: true,
      data: result[0],
      message: 'Queue created successfully'
    }, 201);
  } catch (error) {
    console.error('[QueueRoutes] POST /queues error:', error);
    return c.json({
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * PUT /queues/:id
 * Update an existing queue item
 */
queueRoutes.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    const db = getDb();
    const existing = await db.select().from(queueItems).where(eq(queueItems.id, id)).limit(1);

    if (!existing || existing.length === 0) {
      return c.json({
        success: false,
        error: 'Not Found',
        message: `Queue with id ${id} not found`
      }, 404);
    }

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.statusId !== undefined) updateData.statusId = body.statusId;
    if (body.metadata !== undefined) updateData.metadata = body.metadata;

    const result = await db
      .update(queueItems)
      .set(updateData)
      .where(eq(queueItems.id, id))
      .returning();

    // Broadcast SSE event
    sseBroadcaster.broadcast({
      type: 'queue_updated',
      data: result[0],
      boardId: existing[0].boardId
    });

    return c.json({
      success: true,
      data: result[0],
      message: 'Queue updated successfully'
    });
  } catch (error) {
    console.error('[QueueRoutes] PUT /queues/:id error:', error);
    return c.json({
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * DELETE /queues/:id
 * Delete a queue item
 */
queueRoutes.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const db = getDb();

    const existing = await db.select().from(queueItems).where(eq(queueItems.id, id)).limit(1);

    if (!existing || existing.length === 0) {
      return c.json({
        success: false,
        error: 'Not Found',
        message: `Queue with id ${id} not found`
      }, 404);
    }

    await db.delete(queueItems).where(eq(queueItems.id, id));

    // Broadcast SSE event
    sseBroadcaster.broadcast({
      type: 'queue_deleted',
      data: { id },
      boardId: existing[0].boardId
    });

    return c.json({
      success: true,
      data: { id },
      message: 'Queue deleted successfully'
    });
  } catch (error) {
    console.error('[QueueRoutes] DELETE /queues/:id error:', error);
    return c.json({
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});
