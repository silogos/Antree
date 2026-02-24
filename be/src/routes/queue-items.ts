/**
 * Queue Item Routes
 * API endpoints for queue item management
 */

import { Hono } from 'hono';
import { queueItemService } from '../services/queue-item.service.js';
import { sseBroadcaster } from '../sse/broadcaster.js';
import {
  successResponse,
  notFoundResponse,
  validationErrorResponse,
  internalErrorResponse,
} from '../middleware/response.js';
import { validateBody } from '../middleware/validation.js';
import {
  createQueueItemSchema,
  updateQueueItemSchema,
} from '../validators/queue-item.validator.js';
import type { QueueItemDTO } from '../types/session.dto.js';

export const queueItemRoutes = new Hono();

/**
 * GET /queue-items
 * Get all queue items. Optionally filter by session or status.
 */
queueItemRoutes.get('/', async (c) => {
  try {
    const queueId = c.req.query('queueId');
    const sessionId = c.req.query('sessionId');
    const statusId = c.req.query('statusId');

    const filters = {
      queueId,
      sessionId,
      statusId,
    };

    const items = await queueItemService.getAllQueueItems(filters);
    return c.json(successResponse(items, undefined, items.length));
  } catch (error) {
    console.error('[QueueItemRoutes] GET /queue-items error:', error);
    return c.json(internalErrorResponse(error), 500);
  }
});

/**
 * GET /queue-items/:id
 * Get a single queue item by ID
 */
queueItemRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const item = await queueItemService.getQueueItemById(id);

    if (!item) {
      return c.json(notFoundResponse('Queue item', id), 404);
    }

    return c.json(successResponse(item));
  } catch (error) {
    console.error('[QueueItemRoutes] GET /queue-items/:id error:', error);
    return c.json(internalErrorResponse(error), 500);
  }
});

/**
 * POST /queue-items
 * Create a new queue item
 */
queueItemRoutes.post('/', validateBody(createQueueItemSchema), async (c) => {
  try {
    const input = c.get('validatedBody') as Parameters<typeof queueItemService.createQueueItem>[0];
    const item = await queueItemService.createQueueItem(input);

    // Broadcast SSE event
    sseBroadcaster.broadcast({
      type: 'queue_item_created',
      data: item,
      queueId: item.queueId,
    });

    return c.json(successResponse(item, 'Queue item created successfully'), 201);
  } catch (error) {
    console.error('[QueueItemRoutes] POST /queue-items error:', error);
    return c.json(internalErrorResponse(error), 500);
  }
});

/**
 * PUT /queue-items/:id
 * Update an existing queue item
 */
queueItemRoutes.put('/:id', validateBody(updateQueueItemSchema), async (c) => {
  try {
    const id = c.req.param('id');
    const input = c.get('validatedBody') as Parameters<typeof queueItemService.updateQueueItem>[1];

    // Get existing item for SSE broadcast
    const existing = await queueItemService.getQueueItemById(id);
    if (!existing) {
      return c.json(notFoundResponse('Queue item', id), 404);
    }

    const item = await queueItemService.updateQueueItem(id, input);

    if (!item) {
      return c.json(notFoundResponse('Queue item', id), 404);
    }

    // Broadcast SSE event
    sseBroadcaster.broadcast({
      type: 'queue_item_updated',
      data: item,
      queueId: existing.queueId,
    });

    return c.json(successResponse(item, 'Queue item updated successfully'));
  } catch (error) {
    console.error('[QueueItemRoutes] PUT /queue-items/:id error:', error);
    return c.json(internalErrorResponse(error), 500);
  }
});

/**
 * DELETE /queue-items/:id
 * Delete a queue item
 */
queueItemRoutes.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    // Get existing item for SSE broadcast
    const existing = await queueItemService.getQueueItemById(id);
    if (!existing) {
      return c.json(notFoundResponse('Queue item', id), 404);
    }

    const deleted = await queueItemService.deleteQueueItem(id);

    if (!deleted) {
      return c.json(notFoundResponse('Queue item', id), 404);
    }

    // Broadcast SSE event
    sseBroadcaster.broadcast({
      type: 'queue_item_deleted',
      data: { id },
      queueId: existing.queueId,
    });

    return c.json(successResponse({ id }, 'Queue item deleted successfully'));
  } catch (error) {
    console.error('[QueueItemRoutes] DELETE /queue-items/:id error:', error);
    return c.json(internalErrorResponse(error), 500);
  }
});
