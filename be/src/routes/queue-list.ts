import { Hono } from 'hono';
import { getDb } from '../db/index.js';
import { queues, queueBatches, queueStatuses, queueTemplateStatuses, queueTemplates } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { sseBroadcaster } from '../sse/broadcaster.js';

export const queueListRoutes = new Hono();

/**
 * GET /queues
 * Get all queues
 */
queueListRoutes.get('/', async (c) => {
  try {
    const templateId = c.req.query('templateId');
    const isActive = c.req.query('isActive');

    const db = getDb();
    let queueList;

    if (isActive !== undefined) {
      const isActiveBool = isActive === 'true';
      if (templateId) {
        queueList = await db
          .select()
          .from(queues)
          .where(and(eq(queues.templateId, templateId), eq(queues.isActive, isActiveBool)))
          .orderBy(desc(queues.createdAt));
      } else {
        queueList = await db
          .select()
          .from(queues)
          .where(eq(queues.isActive, isActiveBool))
          .orderBy(desc(queues.createdAt));
      }
    } else if (templateId) {
      queueList = await db
        .select()
        .from(queues)
        .where(eq(queues.templateId, templateId))
        .orderBy(desc(queues.createdAt));
    } else {
      queueList = await db.select().from(queues).orderBy(desc(queues.createdAt));
    }

    return c.json({
      success: true,
      data: queueList,
      total: queueList?.length || 0
    });
  } catch (error) {
    console.error('[QueueListRoutes] GET /queues error:', error);
    return c.json({
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * GET /queues/:id
 * Get a single queue
 */
queueListRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const db = getDb();
    const queue = await db.select().from(queues).where(eq(queues.id, id)).limit(1);

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
    console.error('[QueueListRoutes] GET /queues/:id error:', error);
    return c.json({
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * GET /queues/:id/active-batch
 * Get active batch for a queue
 */
queueListRoutes.get('/:id/active-batch', async (c) => {
  try {
    const id = c.req.param('id');
    const db = getDb();

    // Verify queue exists
    const queue = await db.select().from(queues).where(eq(queues.id, id)).limit(1);
    if (!queue || queue.length === 0) {
      return c.json({
        success: false,
        error: 'Not Found',
        message: `Queue with id ${id} not found`
      }, 404);
    }

    // Get active batch
    const activeBatch = await db
      .select()
      .from(queueBatches)
      .where(and(eq(queueBatches.queueId, id), eq(queueBatches.status, 'active')))
      .limit(1);

    if (!activeBatch || activeBatch.length === 0) {
      return c.json({
        success: true,
        data: null,
        message: 'No active batch found for this queue'
      });
    }

    // Get statuses for the batch
    const statuses = await db
      .select()
      .from(queueStatuses)
      .where(eq(queueStatuses.queueId, activeBatch[0].id))
      .orderBy(queueStatuses.order);

    return c.json({
      success: true,
      data: {
        batch: activeBatch[0],
        statuses: statuses
      }
    });
  } catch (error) {
    console.error('[QueueListRoutes] GET /queues/:id/active-batch error:', error);
    return c.json({
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * POST /queues
 * Create a new queue
 */
queueListRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json();

    // Validation
    if (!body.name || !body.templateId) {
      return c.json({
        success: false,
        error: 'Validation Error',
        message: 'name and templateId are required'
      }, 400);
    }

    const db = getDb();

    // Verify template exists
    const template = await db.select().from(queueTemplates).where(eq(queueTemplates.id, body.templateId)).limit(1);
    if (!template || template.length === 0) {
      return c.json({
        success: false,
        error: 'Not Found',
        message: `Template with id ${body.templateId} not found`
      }, 404);
    }

    const newQueue = {
      id: uuidv4(),
      name: body.name,
      templateId: body.templateId,
      createdBy: body.createdBy || null,
      updatedBy: body.updatedBy || null,
      isActive: body.isActive !== undefined ? body.isActive : true,
    };

    const result = await db.insert(queues).values(newQueue).returning();

    // Broadcast SSE event
    sseBroadcaster.broadcast({
      type: 'queue_created',
      data: result[0],
      queueId: result[0].id,
    });

    return c.json({
      success: true,
      data: result[0],
      message: 'Queue created successfully'
    }, 201);
  } catch (error) {
    console.error('[QueueListRoutes] POST /queues error:', error);
    return c.json({
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * PUT /queues/:id
 * Update a queue
 */
queueListRoutes.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    const db = getDb();
    const existing = await db.select().from(queues).where(eq(queues.id, id)).limit(1);

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
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.updatedBy !== undefined) updateData.updatedBy = body.updatedBy;

    const result = await db
      .update(queues)
      .set(updateData)
      .where(eq(queues.id, id))
      .returning();

    // Broadcast SSE event
    sseBroadcaster.broadcast({
      type: 'queue_updated',
      data: result[0],
      queueId: id,
    });

    return c.json({
      success: true,
      data: result[0],
      message: 'Queue updated successfully'
    });
  } catch (error) {
    console.error('[QueueListRoutes] PUT /queues/:id error:', error);
    return c.json({
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * DELETE /queues/:id
 * Delete a queue (cascades to batches, statuses, items)
 */
queueListRoutes.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const db = getDb();

    const existing = await db.select().from(queues).where(eq(queues.id, id)).limit(1);

    if (!existing || existing.length === 0) {
      return c.json({
        success: false,
        error: 'Not Found',
        message: `Queue with id ${id} not found`
      }, 404);
    }

    await db.delete(queues).where(eq(queues.id, id));

    // Broadcast SSE event
    sseBroadcaster.broadcast({
      type: 'queue_deleted',
      data: { id },
      queueId: id,
    });

    return c.json({
      success: true,
      data: { id },
      message: 'Queue deleted successfully'
    });
  } catch (error) {
    console.error('[QueueListRoutes] DELETE /queues/:id error:', error);
    return c.json({
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * POST /queues/:id/reset
 * Reset queue by closing current active batch and creating a new one
 */
queueListRoutes.post('/:id/reset', async (c) => {
  try {
    const id = c.req.param('id');
    const db = getDb();

    // Verify queue exists
    const queue = await db.select().from(queues).where(eq(queues.id, id)).limit(1);
    if (!queue || queue.length === 0) {
      return c.json({
        success: false,
        error: 'Not Found',
        message: `Queue with id ${id} not found`
      }, 404);
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
    const body = await c.req.json();
    const newBatch = {
      id: uuidv4(),
      queueId: id,
      name: body?.name || `Batch - ${new Date().toISOString()}`,
      status: 'active',
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

      const batchStatuses = templateStatuses.map(ts => ({
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

    // Broadcast SSE event
    sseBroadcaster.broadcast({
      type: 'batch_created',
      data: { ...batchResult[0] },
      queueId: id,
    });

    return c.json({
      success: true,
      data: batchResult[0],
      message: 'Queue reset successfully - new batch created'
    });
  } catch (error) {
    console.error('[QueueListRoutes] POST /queues/:id/reset error:', error);
    return c.json({
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});
