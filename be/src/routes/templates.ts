import { Hono } from 'hono';
import { getDb } from '../db/index.js';
import { queueTemplates, queueTemplateStatuses } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { sseBroadcaster } from '../sse/broadcaster.js';

export const templateRoutes = new Hono();

/**
 * GET /templates
 * Get all templates
 */
templateRoutes.get('/', async (c) => {
  try {
    const db = getDb();
    const templates = await db
      .select()
      .from(queueTemplates)
      .orderBy(desc(queueTemplates.createdAt));

    return c.json({
      success: true,
      data: templates,
      total: templates.length
    });
  } catch (error) {
    console.error('[TemplateRoutes] GET /templates error:', error);
    return c.json({
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * GET /templates/:id
 * Get a single template
 */
templateRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const db = getDb();
    const template = await db.select().from(queueTemplates).where(eq(queueTemplates.id, id)).limit(1);

    if (!template || template.length === 0) {
      return c.json({
        success: false,
        error: 'Not Found',
        message: `Template with id ${id} not found`
      }, 404);
    }

    return c.json({
      success: true,
      data: template[0]
    });
  } catch (error) {
    console.error('[TemplateRoutes] GET /templates/:id error:', error);
    return c.json({
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * POST /templates
 * Create a new template
 */
templateRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json();

    // Validation
    if (!body.name || body.name.length < 3 || body.name.length > 100) {
      return c.json({
        success: false,
        error: 'Validation Error',
        message: 'name is required and must be between 3-100 characters'
      }, 400);
    }

    const db = getDb();
    const newTemplate = {
      id: uuidv4(),
      name: body.name,
      description: body.description || null,
      isActive: body.isActive !== undefined ? body.isActive : true,
    };

    const result = await db.insert(queueTemplates).values(newTemplate).returning();

    // Broadcast SSE event
    sseBroadcaster.broadcast({
      type: 'template_created',
      data: result[0],
      boardId: result[0].id, // Use template ID for SSE compatibility
    });

    return c.json({
      success: true,
      data: result[0],
      message: 'Template created successfully'
    }, 201);
  } catch (error) {
    console.error('[TemplateRoutes] POST /templates error:', error);
    return c.json({
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * PUT /templates/:id
 * Update a template
 */
templateRoutes.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    const db = getDb();
    const existing = await db.select().from(queueTemplates).where(eq(queueTemplates.id, id)).limit(1);

    if (!existing || existing.length === 0) {
      return c.json({
        success: false,
        error: 'Not Found',
        message: `Template with id ${id} not found`
      }, 404);
    }

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const result = await db
      .update(queueTemplates)
      .set(updateData)
      .where(eq(queueTemplates.id, id))
      .returning();

    // Broadcast SSE event
    sseBroadcaster.broadcast({
      type: 'template_updated',
      data: result[0],
      boardId: result[0].id,
    });

    return c.json({
      success: true,
      data: result[0],
      message: 'Template updated successfully'
    });
  } catch (error) {
    console.error('[TemplateRoutes] PUT /templates/:id error:', error);
    return c.json({
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * DELETE /templates/:id
 * Delete a template
 */
templateRoutes.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const db = getDb();

    const existing = await db.select().from(queueTemplates).where(eq(queueTemplates.id, id)).limit(1);

    if (!existing || existing.length === 0) {
      return c.json({
        success: false,
        error: 'Not Found',
        message: `Template with id ${id} not found`
      }, 404);
    }

    await db.delete(queueTemplates).where(eq(queueTemplates.id, id));

    // Broadcast SSE event
    sseBroadcaster.broadcast({
      type: 'template_deleted',
      data: { id },
      boardId: id,
    });

    return c.json({
      success: true,
      data: { id },
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('[TemplateRoutes] DELETE /templates/:id error:', error);
    return c.json({
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * GET /templates/:id/statuses
 * Get statuses for a template
 */
templateRoutes.get('/:id/statuses', async (c) => {
  try {
    const id = c.req.param('id');
    const db = getDb();

    // Verify template exists
    const template = await db.select().from(queueTemplates).where(eq(queueTemplates.id, id)).limit(1);
    if (!template || template.length === 0) {
      return c.json({
        success: false,
        error: 'Not Found',
        message: `Template with id ${id} not found`
      }, 404);
    }

    const statuses = await db
      .select()
      .from(queueTemplateStatuses)
      .where(eq(queueTemplateStatuses.templateId, id))
      .orderBy(queueTemplateStatuses.order);

    return c.json({
      success: true,
      data: statuses,
      total: statuses.length
    });
  } catch (error) {
    console.error('[TemplateRoutes] GET /templates/:id/statuses error:', error);
    return c.json({
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * POST /templates/:id/statuses
 * Add status to a template
 */
templateRoutes.post('/:id/statuses', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    // Validation
    if (!body.label || !body.color || body.order === undefined) {
      return c.json({
        success: false,
        error: 'Validation Error',
        message: 'label, color, and order are required'
      }, 400);
    }

    const db = getDb();

    // Verify template exists
    const template = await db.select().from(queueTemplates).where(eq(queueTemplates.id, id)).limit(1);
    if (!template || template.length === 0) {
      return c.json({
        success: false,
        error: 'Not Found',
        message: `Template with id ${id} not found`
      }, 404);
    }

    const newStatus = {
      id: uuidv4(),
      templateId: id,
      label: body.label,
      color: body.color,
      order: body.order,
    };

    const result = await db.insert(queueTemplateStatuses).values(newStatus).returning();

    return c.json({
      success: true,
      data: result[0],
      message: 'Template status created successfully'
    }, 201);
  } catch (error) {
    console.error('[TemplateRoutes] POST /templates/:id/statuses error:', error);
    return c.json({
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});
