import { Hono } from 'hono';
import { getDb } from '../db/index.js';
import { queueStatuses } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { sseBroadcaster } from '../sse/broadcaster.js';

export const statusRoutes = new Hono();

/**
 * GET /statuses
 * Get all status items for a batch, ordered by their display order
 */
statusRoutes.get('/', async (c) => {
  try {
    const queueId = c.req.query('queueId');

    if (!queueId) {
      return c.json({
        success: false,
        error: 'Validation Error',
        message: 'queueId query parameter is required'
      }, 400);
    }

    const db = getDb();
    const statuses = await db
      .select()
      .from(queueStatuses)
      .where(eq(queueStatuses.queueId, queueId as string))
      .orderBy(queueStatuses.order);

    return c.json({
      success: true,
      data: statuses,
      total: statuses.length
    });
  } catch (error) {
    console.error('[StatusRoutes] GET /statuses error:', error);
    return c.json({
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * GET /statuses/:id
 * Get a single status by ID
 */
statusRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const db = getDb();
    const status = await db.select().from(queueStatuses).where(eq(queueStatuses.id, id)).limit(1);

    if (!status || status.length === 0) {
      return c.json({
        success: false,
        error: 'Not Found',
        message: `Status with id ${id} not found`
      }, 404);
    }

    return c.json({
      success: true,
      data: status[0]
    });
  } catch (error) {
    console.error('[StatusRoutes] GET /statuses/:id error:', error);
    return c.json({
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * POST /statuses
 * Create a new status
 */
statusRoutes.post('/', async (c) => {
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
    if (!body.label || !body.color || body.order === undefined) {
      return c.json({
        success: false,
        error: 'Validation Error',
        message: 'label, color, and order are required'
      }, 400);
    }

    const db = getDb();
    const newStatus = {
      id: uuidv4(),
      queueId: body.queueId,
      templateStatusId: body.templateStatusId || null,
      label: body.label,
      color: body.color,
      order: body.order,
    };

    const result = await db.insert(queueStatuses).values(newStatus).returning();

    // Broadcast SSE event
    sseBroadcaster.broadcast({
      type: 'status_created',
      data: result[0],
      queueId: result[0].queueId,
    });

    return c.json({
      success: true,
      data: result[0],
      message: 'Status created successfully'
    }, 201);
  } catch (error) {
    console.error('[StatusRoutes] POST /statuses error:', error);
    return c.json({
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * PUT /statuses/:id
 * Update an existing status
 */
statusRoutes.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    const db = getDb();
    const existing = await db.select().from(queueStatuses).where(eq(queueStatuses.id, id)).limit(1);

    if (!existing || existing.length === 0) {
      return c.json({
        success: false,
        error: 'Not Found',
        message: `Status with id ${id} not found`
      }, 404);
    }

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};
    if (body.label !== undefined) updateData.label = body.label;
    if (body.color !== undefined) updateData.color = body.color;
    if (body.order !== undefined) updateData.order = body.order;
    if (body.templateStatusId !== undefined) updateData.templateStatusId = body.templateStatusId;

    const result = await db
      .update(queueStatuses)
      .set(updateData)
      .where(eq(queueStatuses.id, id))
      .returning();

    // Broadcast SSE event
    sseBroadcaster.broadcast({
      type: 'status_updated',
      data: result[0],
      queueId: existing[0].queueId,
    });

    return c.json({
      success: true,
      data: result[0],
      message: 'Status updated successfully'
    });
  } catch (error) {
    console.error('[StatusRoutes] PUT /statuses/:id error:', error);
    return c.json({
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * DELETE /statuses/:id
 * Delete a status (fails if queues reference it due to foreign key constraint)
 */
statusRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id');

  try {
    const db = getDb();

    const existing = await db.select().from(queueStatuses).where(eq(queueStatuses.id, id)).limit(1);

    if (!existing || existing.length === 0) {
      return c.json({
        success: false,
        error: 'Not Found',
        message: `Status with id ${id} not found`
      }, 404);
    }

    await db.delete(queueStatuses).where(eq(queueStatuses.id, id));

    // Broadcast SSE event
    sseBroadcaster.broadcast({
      type: 'status_deleted',
      data: { id },
      queueId: existing[0].queueId,
    });

    return c.json({
      success: true,
      data: { id },
      message: 'Status deleted successfully'
    });
  } catch (error) {
    // Check if it's a foreign key constraint error
    if (error instanceof Error && error.message.includes('violates foreign key constraint')) {
      return c.json({
        success: false,
        error: 'Conflict',
        message: `Cannot delete status with id ${id} because it is referenced by one or more queues`
      }, 409);
    }

    console.error('[StatusRoutes] DELETE /statuses/:id error:', error);
    return c.json({
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});
