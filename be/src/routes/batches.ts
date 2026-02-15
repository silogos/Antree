import { Hono } from 'hono';
import { getDb } from '../db/index.js';
import { queueBatches, queueTemplates, queueTemplateStatuses, queueStatuses, queues } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { sseBroadcaster } from '../sse/broadcaster.js';

export const batchRoutes = new Hono();

/**
 * GET /batches
 * Get all batches
 */
batchRoutes.get('/', async (c) => {
  try {
    const queueId = c.req.query('queueId');
    const status = c.req.query('status'); // active, closed

    const db = getDb();
    let batches;

    if (queueId) {
      // Filter by queue
      if (status) {
        batches = await db
          .select()
          .from(queueBatches)
          .where(and(eq(queueBatches.queueId, queueId), eq(queueBatches.status, status)))
          .orderBy(desc(queueBatches.createdAt));
      } else {
        batches = await db
          .select()
          .from(queueBatches)
          .where(eq(queueBatches.queueId, queueId))
          .orderBy(desc(queueBatches.createdAt));
      }
    } else {
      // Get all batches
      batches = await db
        .select()
        .from(queueBatches)
        .orderBy(desc(queueBatches.createdAt));
    }

    return c.json({
      success: true,
      data: batches,
      total: batches.length
    });
  } catch (error) {
    console.error('[BatchRoutes] GET /batches error:', error);
    return c.json({
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * GET /batches/:id
 * Get a single batch
 */
batchRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const db = getDb();
    const batch = await db.select().from(queueBatches).where(eq(queueBatches.id, id)).limit(1);

    if (!batch || batch.length === 0) {
      return c.json({
        success: false,
        error: 'Not Found',
        message: `Batch with id ${id} not found`
      }, 404);
    }

    return c.json({
      success: true,
      data: batch[0]
    });
  } catch (error) {
    console.error('[BatchRoutes] GET /batches/:id error:', error);
    return c.json({
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * POST /batches
 * Create a new batch (copies statuses from template)
 */
batchRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json();

    // Validation
    if (!body.queueId) {
      return c.json({
        success: false,
        error: 'Validation Error',
        message: 'queueId is required'
      }, 400);
    }

    const db = getDb();

    // Verify queue exists
    const queue = await db.select().from(queues).where(eq(queues.id, body.queueId)).limit(1);
    if (!queue || queue.length === 0) {
      return c.json({
        success: false,
        error: 'Not Found',
        message: `Queue with id ${body.queueId} not found`
      }, 404);
    }

    // Get template for the queue
    const template = await db.select().from(queueTemplates).where(eq(queueTemplates.id, queue[0].templateId)).limit(1);

    // Create batch
    const newBatch = {
      id: uuidv4(),
      queueId: body.queueId,
      name: body.name || `Batch - ${new Date().toISOString()}`,
      status: body.status || 'active',
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
      const batchStatuses = templateStatuses.map(ts => ({
        id: uuidv4(),
        queueId: batchId,
        templateStatusId: ts.id, // Track origin
        label: ts.label,
        color: ts.color,
        order: ts.order,
      }));

      if (batchStatuses.length > 0) {
        await db.insert(queueStatuses).values(batchStatuses);
      }

      console.log(`[BatchRoutes] Created batch ${batchId}`);
    }

    // Broadcast SSE event
    sseBroadcaster.broadcast({
      type: 'batch_created',
      data: batchResult[0],
      queueId: body.queueId,
    });

    return c.json({
      success: true,
      data: batchResult[0],
      message: 'Batch created successfully with copied statuses'
    }, 201);
  } catch (error) {
    console.error('[BatchRoutes] POST /batches error:', error);
    return c.json({
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * PUT /batches/:id
 * Update a batch
 */
batchRoutes.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    const db = getDb();
    const existing = await db.select().from(queueBatches).where(eq(queueBatches.id, id)).limit(1);

    if (!existing || existing.length === 0) {
      return c.json({
        success: false,
        error: 'Not Found',
        message: `Batch with id ${id} not found`
      }, 404);
    }

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.status !== undefined) updateData.status = body.status;

    const result = await db
      .update(queueBatches)
      .set(updateData)
      .where(eq(queueBatches.id, id))
      .returning();

    // Broadcast SSE event
    sseBroadcaster.broadcast({
      type: 'batch_updated',
      data: result[0],
      batchId: id,
    });

    return c.json({
      success: true,
      data: result[0],
      message: 'Batch updated successfully'
    });
  } catch (error) {
    console.error('[BatchRoutes] PUT /batches/:id error:', error);
    return c.json({
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * DELETE /batches/:id
 * Delete a batch
 */
batchRoutes.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const db = getDb();

    const existing = await db.select().from(queueBatches).where(eq(queueBatches.id, id)).limit(1);

    if (!existing || existing.length === 0) {
      return c.json({
        success: false,
        error: 'Not Found',
        message: `Batch with id ${id} not found`
      }, 404);
    }

    await db.delete(queueBatches).where(eq(queueBatches.id, id));

    // Broadcast SSE event
    sseBroadcaster.broadcast({
      type: 'batch_deleted',
      data: { id },
      batchId: id,
    });

    return c.json({
      success: true,
      data: { id },
      message: 'Batch deleted successfully'
    });
  } catch (error) {
    console.error('[BatchRoutes] DELETE /batches/:id error:', error);
    return c.json({
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});
