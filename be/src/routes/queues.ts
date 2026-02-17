/**
 * Queue Routes
 * API endpoints for queue management (template-based queues)
 */

import { Hono } from 'hono';
import { queueService } from '../services/queue.service.js';
import { sseBroadcaster } from '../sse/broadcaster.js';
import {
  successResponse,
  notFoundResponse,
  validationErrorResponse,
  internalErrorResponse,
} from '../middleware/response.js';
import { validateBody } from '../middleware/validation.js';
import {
  createQueueSchema,
  updateQueueSchema,
  resetQueueSchema,
} from '../validators/queue.validator.js';

export const queueRoutes = new Hono();

/**
 * GET /queues
 * Get all queues
 */
queueRoutes.get('/', async (c) => {
  try {
    const queues = await queueService.getAllQueues();
    return c.json(successResponse(queues, undefined, queues.length));
  } catch (error) {
    console.error('[QueueRoutes] GET /queues error:', error);
    return c.json(internalErrorResponse(error), 500);
  }
});

/**
 * GET /queues/:id
 * Get a single queue with active batch information
 */
queueRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const queue = await queueService.getQueueById(id);

    if (!queue) {
      return c.json(notFoundResponse('Queue', id), 404);
    }

    return c.json(successResponse(queue));
  } catch (error) {
    console.error('[QueueRoutes] GET /queues/:id error:', error);
    return c.json(internalErrorResponse(error), 500);
  }
});

/**
 * GET /queues/:id/active-batch
 * Get active batch for a queue
 */
queueRoutes.get('/:id/active-batch', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await queueService.getActiveBatch(id);

    if (!result) {
      return c.json(successResponse(null, 'No active batch found for this queue'));
    }

    return c.json(successResponse(result));
  } catch (error) {
    console.error('[QueueRoutes] GET /queues/:id/active-batch error:', error);
    return c.json(internalErrorResponse(error), 500);
  }
});

/**
 * POST /queues
 * Create a new queue
 */
queueRoutes.post('/', validateBody(createQueueSchema), async (c) => {
  try {
    const input = c.get('validatedBody') as Parameters<typeof queueService.createQueue>[0];
    const queue = await queueService.createQueue(input);

    if (!queue) {
      return c.json(
        successResponse(null, 'Template not found'),
        404
      );
    }

    // Broadcast SSE event
    sseBroadcaster.broadcast({
      type: 'queue_created',
      data: queue,
      queueId: queue.id,
    });

    return c.json(successResponse(queue, 'Queue created successfully'), 201);
  } catch (error) {
    console.error('[QueueRoutes] POST /queues error:', error);
    return c.json(internalErrorResponse(error), 500);
  }
});

/**
 * PUT /queues/:id
 * Update a queue
 */
queueRoutes.put('/:id', validateBody(updateQueueSchema), async (c) => {
  try {
    const id = c.req.param('id');
    const input = c.get('validatedBody') as Parameters<typeof queueService.updateQueue>[1];
    const queue = await queueService.updateQueue(id, input);

    if (!queue) {
      return c.json(notFoundResponse('Queue', id), 404);
    }

    // Broadcast SSE event
    sseBroadcaster.broadcast({
      type: 'queue_updated',
      data: queue,
      queueId: id,
    });

    return c.json(successResponse(queue, 'Queue updated successfully'));
  } catch (error) {
    console.error('[QueueRoutes] PUT /queues/:id error:', error);
    return c.json(internalErrorResponse(error), 500);
  }
});

/**
 * DELETE /queues/:id
 * Delete a queue (cascades to batches, statuses, items)
 */
queueRoutes.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const deleted = await queueService.deleteQueue(id);

    if (!deleted) {
      return c.json(notFoundResponse('Queue', id), 404);
    }

    // Broadcast SSE event
    sseBroadcaster.broadcast({
      type: 'queue_deleted',
      data: { id },
      queueId: id,
    });

    return c.json(successResponse({ id }, 'Queue deleted successfully'));
  } catch (error) {
    console.error('[QueueRoutes] DELETE /queues/:id error:', error);
    return c.json(internalErrorResponse(error), 500);
  }
});

/**
 * POST /queues/:id/reset
 * Reset queue by closing current active batch and creating a new one
 */
queueRoutes.post('/:id/reset', validateBody(resetQueueSchema), async (c) => {
  try {
    const id = c.req.param('id');
    const input = c.get('validatedBody') as Parameters<typeof queueService.resetQueue>[1];
    const batch = await queueService.resetQueue(id, input);

    if (!batch) {
      return c.json(notFoundResponse('Queue', id), 404);
    }

    // Broadcast SSE event
    sseBroadcaster.broadcast({
      type: 'batch_created',
      data: batch,
      queueId: id,
    });

    return c.json(successResponse(batch, 'Queue reset successfully - new batch created'));
  } catch (error) {
    console.error('[QueueRoutes] POST /queues/:id/reset error:', error);
    return c.json(internalErrorResponse(error), 500);
  }
});
