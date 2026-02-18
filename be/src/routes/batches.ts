/**
 * Batch Routes
 * API endpoints for batch management
 */

import { Hono } from 'hono';
import { batchService } from '../services/batch.service.js';
import { sseBroadcaster } from '../sse/broadcaster.js';
import {
  successResponse,
  notFoundResponse,
  validationErrorResponse,
  internalErrorResponse,
} from '../middleware/response.js';
import { validateBody } from '../middleware/validation.js';
import { createBatchSchema, updateBatchSchema } from '../validators/batch.validator.js';

export const batchRoutes = new Hono();

/**
 * GET /batches
 * Get all batches
 */
batchRoutes.get('/', async (c) => {
  try {
    const queueId = c.req.query('queueId');
    const status = c.req.query('status') as 'active' | 'closed' | undefined;

    const filters = {
      queueId,
      status,
    };

    const batches = await batchService.getAllBatches(filters);
    return c.json(successResponse(batches, undefined, batches.length));
  } catch (error) {
    console.error('[BatchRoutes] GET /batches error:', error);
    return c.json(internalErrorResponse(error), 500);
  }
});

/**
 * GET /batches/:id
 * Get a single batch
 */
batchRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const batch = await batchService.getBatchById(id);

    if (!batch) {
      return c.json(notFoundResponse('Batch', id), 404);
    }

    return c.json(successResponse(batch));
  } catch (error) {
    console.error('[BatchRoutes] GET /batches/:id error:', error);
    return c.json(internalErrorResponse(error), 500);
  }
});

/**
 * GET /batches/:id/statuses
 * Get all statuses for a batch
 */
batchRoutes.get('/:id/statuses', async (c) => {
  try {
    const id = c.req.param('id');
    const statuses = await batchService.getBatchStatuses(id);

    if (!statuses || statuses.length === 0) {
      return c.json(successResponse([], 'No statuses found for this batch'));
    }

    return c.json(successResponse(statuses));
  } catch (error) {
    console.error('[BatchRoutes] GET /batches/:id/statuses error:', error);
    return c.json(internalErrorResponse(error), 500);
  }
});

/**
 * POST /batches
 * Create a new batch (copies statuses from template)
 */
batchRoutes.post('/', validateBody(createBatchSchema), async (c) => {
  try {
    const input = c.get('validatedBody') as Parameters<typeof batchService.createBatch>[0];
    const batch = await batchService.createBatch(input);

    if (!batch) {
      return c.json(successResponse(null, 'Queue not found'), 404);
    }

    // Broadcast SSE event
    sseBroadcaster.broadcast({
      type: 'batch_created',
      data: batch,
      queueId: input.queueId,
    });

    return c.json(successResponse(batch, 'Batch created successfully with copied statuses'), 201);
  } catch (error) {
    console.error('[BatchRoutes] POST /batches error:', error);
    return c.json(internalErrorResponse(error), 500);
  }
});

/**
 * PUT /batches/:id
 * Update a batch
 */
batchRoutes.put('/:id', validateBody(updateBatchSchema), async (c) => {
  try {
    const id = c.req.param('id');
    const input = c.get('validatedBody') as Parameters<typeof batchService.updateBatch>[1];
    const batch = await batchService.updateBatch(id, input);

    if (!batch) {
      return c.json(notFoundResponse('Batch', id), 404);
    }

    // Broadcast SSE event
    sseBroadcaster.broadcast({
      type: 'batch_updated',
      data: batch,
      batchId: id,
    });

    return c.json(successResponse(batch, 'Batch updated successfully'));
  } catch (error) {
    console.error('[BatchRoutes] PUT /batches/:id error:', error);
    return c.json(internalErrorResponse(error), 500);
  }
});

/**
 * DELETE /batches/:id
 * Delete a batch
 */
batchRoutes.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const deleted = await batchService.deleteBatch(id);

    if (!deleted) {
      return c.json(notFoundResponse('Batch', id), 404);
    }

    // Broadcast SSE event
    sseBroadcaster.broadcast({
      type: 'batch_deleted',
      data: { id },
      batchId: id,
    });

    return c.json(successResponse({ id }, 'Batch deleted successfully'));
  } catch (error) {
    console.error('[BatchRoutes] DELETE /batches/:id error:', error);
    return c.json(internalErrorResponse(error), 500);
  }
});
