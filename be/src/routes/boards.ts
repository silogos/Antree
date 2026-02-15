import { Hono } from 'hono';
import { getDb } from '../db/index.js';
import { queueBoards } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { sseBroadcaster } from '../sse/broadcaster.js';

export const boardRoutes = new Hono();

/**
 * GET /boards
 * Get all queue boards
 */
boardRoutes.get('/', async (c) => {
  try {
    const db = getDb();
    const boards = await db.select().from(queueBoards).orderBy(queueBoards.createdAt);

    return c.json({
      success: true,
      data: boards,
      total: boards.length
    });
  } catch (error) {
    console.error('[BoardRoutes] GET /boards error:', error);
    return c.json({
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * GET /boards/:id
 * Get a single board by ID
 */
boardRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const db = getDb();
    const board = await db.select().from(queueBoards).where(eq(queueBoards.id, id)).limit(1);

    if (!board || board.length === 0) {
      return c.json({
        success: false,
        error: 'Not Found',
        message: `Board with id ${id} not found`
      }, 404);
    }

    return c.json({
      success: true,
      data: board[0]
    });
  } catch (error) {
    console.error('[BoardRoutes] GET /boards/:id error:', error);
    return c.json({
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * POST /boards
 * Create a new queue board
 */
boardRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json();

    // Validation
    if (!body.name) {
      return c.json({
        success: false,
        error: 'Validation Error',
        message: 'name is required'
      }, 400);
    }

    const db = getDb();
    const newBoard = {
      id: uuidv4(),
      name: body.name,
      description: body.description || null,
      isActive: body.isActive !== undefined ? body.isActive : true,
    };

    const result = await db.insert(queueBoards).values(newBoard).returning();

    return c.json({
      success: true,
      data: result[0],
      message: 'Board created successfully'
    }, 201);
  } catch (error) {
    console.error('[BoardRoutes] POST /boards error:', error);
    return c.json({
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * PUT /boards/:id
 * Update an existing board
 */
boardRoutes.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    const db = getDb();
    const existing = await db.select().from(queueBoards).where(eq(queueBoards.id, id)).limit(1);

    if (!existing || existing.length === 0) {
      return c.json({
        success: false,
        error: 'Not Found',
        message: `Board with id ${id} not found`
      }, 404);
    }

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const result = await db
      .update(queueBoards)
      .set(updateData)
      .where(eq(queueBoards.id, id))
      .returning();

    // Broadcast SSE event
    sseBroadcaster.broadcast({
      type: 'board_updated',
      data: result[0],
      boardId: id
    });

    return c.json({
      success: true,
      data: result[0],
      message: 'Board updated successfully'
    });
  } catch (error) {
    console.error('[BoardRoutes] PUT /boards/:id error:', error);
    return c.json({
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * DELETE /boards/:id
 * Delete a board (cascade deletes all statuses and queue items)
 */
boardRoutes.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const db = getDb();

    const existing = await db.select().from(queueBoards).where(eq(queueBoards.id, id)).limit(1);

    if (!existing || existing.length === 0) {
      return c.json({
        success: false,
        error: 'Not Found',
        message: `Board with id ${id} not found`
      }, 404);
    }

    await db.delete(queueBoards).where(eq(queueBoards.id, id));

    // Broadcast SSE event
    sseBroadcaster.broadcast({
      type: 'board_deleted',
      data: { id },
      boardId: id
    });

    return c.json({
      success: true,
      data: { id },
      message: 'Board deleted successfully'
    });
  } catch (error) {
    console.error('[BoardRoutes] DELETE /boards/:id error:', error);
    return c.json({
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});
