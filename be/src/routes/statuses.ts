/**
 * Status Routes
 * API endpoints for status management
 */

import { Hono } from 'hono';
import { statusService } from '../services/status.service.js';
import { sseBroadcaster } from '../sse/broadcaster.js';
import {
  successResponse,
  notFoundResponse,
  validationErrorResponse,
  internalErrorResponse,
} from '../middleware/response.js';
import { validateBody } from '../middleware/validation.js';
import { createStatusSchema, updateStatusSchema } from '../validators/status.validator.js';

export const statusRoutes = new Hono();

/**
 * GET /statuses
 * Get all status items for a batch, ordered by their display order
 */
statusRoutes.get('/', async (c) => {
  try {
    const queueId = c.req.query('queueId');

    if (!queueId) {
      return c.json(validationErrorResponse('queueId query parameter is required'), 400);
    }

    const statuses = await statusService.getAllStatuses(queueId);

    if (!statuses) {
      return c.json(successResponse([], undefined, 0));
    }

    return c.json(successResponse(statuses, undefined, statuses.length));
  } catch (error) {
    console.error('[StatusRoutes] GET /statuses error:', error);
    return c.json(internalErrorResponse(error), 500);
  }
});

/**
 * GET /statuses/:id
 * Get a single status by ID
 */
statusRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const status = await statusService.getStatusById(id);

    if (!status) {
      return c.json(notFoundResponse('Status', id), 404);
    }

    return c.json(successResponse(status));
  } catch (error) {
    console.error('[StatusRoutes] GET /statuses/:id error:', error);
    return c.json(internalErrorResponse(error), 500);
  }
});

/**
 * POST /statuses
 * Create a new status
 */
statusRoutes.post('/', validateBody(createStatusSchema), async (c) => {
  try {
    const input = c.get('validatedBody') as Parameters<typeof statusService.createStatus>[0];
    const status = await statusService.createStatus(input);

    // Broadcast SSE event
    sseBroadcaster.broadcast({
      type: 'status_created',
      data: status,
      queueId: status.queueId,
    });

    return c.json(successResponse(status, 'Status created successfully'), 201);
  } catch (error) {
    console.error('[StatusRoutes] POST /statuses error:', error);
    return c.json(internalErrorResponse(error), 500);
  }
});

/**
 * PUT /statuses/:id
 * Update an existing status
 */
statusRoutes.put('/:id', validateBody(updateStatusSchema), async (c) => {
  try {
    const id = c.req.param('id');
    const input = c.get('validatedBody') as Parameters<typeof statusService.updateStatus>[1];

    // Get existing status for SSE broadcast
    const existing = await statusService.getStatusById(id);
    if (!existing) {
      return c.json(notFoundResponse('Status', id), 404);
    }

    const status = await statusService.updateStatus(id, input);

    if (!status) {
      return c.json(notFoundResponse('Status', id), 404);
    }

    // Broadcast SSE event
    sseBroadcaster.broadcast({
      type: 'status_updated',
      data: status,
      queueId: existing.queueId,
    });

    return c.json(successResponse(status, 'Status updated successfully'));
  } catch (error) {
    console.error('[StatusRoutes] PUT /statuses/:id error:', error);
    return c.json(internalErrorResponse(error), 500);
  }
});

/**
 * DELETE /statuses/:id
 * Delete a status
 */
statusRoutes.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    // Get existing status for SSE broadcast
    const existing = await statusService.getStatusById(id);
    if (!existing) {
      return c.json(notFoundResponse('Status', id), 404);
    }

    const result = await statusService.deleteStatus(id);

    if (!result.success) {
      if (result.error?.includes('referenced by one or more queues')) {
        return c.json(
          successResponse(null, result.error),
          409
        );
      }
      return c.json(notFoundResponse('Status', id), 404);
    }

    // Broadcast SSE event
    sseBroadcaster.broadcast({
      type: 'status_deleted',
      data: { id },
      queueId: existing.queueId,
    });

    return c.json(successResponse({ id }, 'Status deleted successfully'));
  } catch (error) {
    console.error('[StatusRoutes] DELETE /statuses/:id error:', error);
    return c.json(internalErrorResponse(error), 500);
  }
});
