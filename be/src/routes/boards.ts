/**
 * Board Routes
 * API endpoints for board management
 */

import { Hono } from 'hono';
import { boardService } from '../services/board.service.js';
import { sseBroadcaster } from '../sse/broadcaster.js';
import {
  successResponse,
  notFoundResponse,
  validationErrorResponse,
  internalErrorResponse,
} from '../middleware/response.js';
import { validateBody } from '../middleware/validation.js';
import { createBoardSchema, updateBoardSchema } from '../validators/board.validator.js';

export const boardRoutes = new Hono();

/**
 * GET /boards
 * Get all queue boards
 */
boardRoutes.get('/', async (c) => {
  try {
    const boards = await boardService.getAllBoards();
    return c.json(successResponse(boards, undefined, boards.length));
  } catch (error) {
    console.error('[BoardRoutes] GET /boards error:', error);
    return c.json(internalErrorResponse(error), 500);
  }
});

/**
 * GET /boards/:id
 * Get a single board by ID
 */
boardRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const board = await boardService.getBoardById(id);

    if (!board) {
      return c.json(notFoundResponse('Board', id), 404);
    }

    return c.json(successResponse(board));
  } catch (error) {
    console.error('[BoardRoutes] GET /boards/:id error:', error);
    return c.json(internalErrorResponse(error), 500);
  }
});

/**
 * POST /boards
 * Create a new queue board
 */
boardRoutes.post('/', validateBody(createBoardSchema), async (c) => {
  try {
    const input = c.get('validatedBody') as Parameters<typeof boardService.createBoard>[0];
    const board = await boardService.createBoard(input);
    return c.json(successResponse(board, 'Board created successfully'), 201);
  } catch (error) {
    console.error('[BoardRoutes] POST /boards error:', error);
    return c.json(internalErrorResponse(error), 500);
  }
});

/**
 * PUT /boards/:id
 * Update an existing board
 */
boardRoutes.put('/:id', validateBody(updateBoardSchema), async (c) => {
  try {
    const id = c.req.param('id');
    const input = c.get('validatedBody') as Parameters<typeof boardService.updateBoard>[1];
    const board = await boardService.updateBoard(id, input);

    if (!board) {
      return c.json(notFoundResponse('Board', id), 404);
    }

    // Broadcast SSE event
    sseBroadcaster.broadcast({
      type: 'board_updated',
      data: board,
      boardId: id
    });

    return c.json(successResponse(board, 'Board updated successfully'));
  } catch (error) {
    console.error('[BoardRoutes] PUT /boards/:id error:', error);
    return c.json(internalErrorResponse(error), 500);
  }
});

/**
 * DELETE /boards/:id
 * Delete a board (cascade deletes all statuses and queue items)
 */
boardRoutes.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const deleted = await boardService.deleteBoard(id);

    if (!deleted) {
      return c.json(notFoundResponse('Board', id), 404);
    }

    // Broadcast SSE event
    sseBroadcaster.broadcast({
      type: 'board_deleted',
      data: { id },
      boardId: id
    });

    return c.json(successResponse({ id }, 'Board deleted successfully'));
  } catch (error) {
    console.error('[BoardRoutes] DELETE /boards/:id error:', error);
    return c.json(internalErrorResponse(error), 500);
  }
});
