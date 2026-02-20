/**
 * Items Routes
 * API endpoints for queue item management (matches OpenAPI spec)
 */

import { Hono } from "hono";
import {
	internalErrorResponse,
	notFoundResponse,
	successResponse,
	validationErrorResponse,
} from "../middleware/response.js";
import { validateBody } from "../middleware/validation.js";
import { queueItemService } from "../services/queue-item.service.js";
import { sseBroadcaster } from "../sse/broadcaster.js";
import {
	createQueueItemSchema,
	updateQueueItemSchema,
} from "../validators/queue-item.validator.js";

export const itemRoutes = new Hono();

/**
 * GET /items
 * Get all queue items
 */
itemRoutes.get("/", async (c) => {
	try {
		const queueId = c.req.query("queueId");
		const sessionId = c.req.query("sessionId");
		const statusId = c.req.query("statusId");

		const filters = {
			queueId,
			sessionId,
			statusId,
		};

		const items = await queueItemService.getAllQueueItems(filters);
		return c.json(successResponse(items, undefined, items.length));
	} catch (error) {
		console.error("[ItemRoutes] GET /items error:", error);
		return c.json(internalErrorResponse(error), 500);
	}
});

/**
 * GET /sessions/{sessionId}/items
 * Get all items for a session
 */
itemRoutes.get("/sessions/:sessionId/items", async (c) => {
	try {
		const sessionId = c.req.param("sessionId");
		const statusId = c.req.query("statusId");

		const filters = {
			sessionId,
			statusId,
		};

		const items = await queueItemService.getAllQueueItems(filters);
		return c.json(successResponse(items, undefined, items.length));
	} catch (error) {
		console.error("[ItemRoutes] GET /sessions/:sessionId/items error:", error);
		return c.json(internalErrorResponse(error), 500);
	}
});

/**
 * POST /sessions/{sessionId}/items
 * Create a new queue item within a session
 */
itemRoutes.post(
	"/sessions/:sessionId/items",
	validateBody(createQueueItemSchema),
	async (c) => {
		try {
			const sessionId = c.req.param("sessionId");
			const input = c.get("validatedBody") as Parameters<
				typeof queueItemService.createQueueItem
			>[0];

			// Override sessionId from path
			const itemInput = {
				...input,
				sessionId,
			};

			const item = await queueItemService.createQueueItem(itemInput);

			// Broadcast SSE event
			sseBroadcaster.broadcast({
				type: "item_created",
				data: item,
				sessionId: sessionId,
			});

			return c.json(
				successResponse(item, "Queue item created successfully"),
				201,
			);
		} catch (error) {
			console.error(
				"[ItemRoutes] POST /sessions/:sessionId/items error:",
				error,
			);
			return c.json(internalErrorResponse(error), 500);
		}
	},
);

/**
 * GET /items/{id}
 * Get a single queue item by ID
 */
itemRoutes.get("/:id", async (c) => {
	try {
		const id = c.req.param("id");
		const item = await queueItemService.getQueueItemById(id);

		if (!item) {
			return c.json(notFoundResponse("Queue item", id), 404);
		}

		return c.json(successResponse(item));
	} catch (error) {
		console.error("[ItemRoutes] GET /items/:id error:", error);
		return c.json(internalErrorResponse(error), 500);
	}
});

/**
 * PATCH /items/{id}
 * Update an existing queue item
 */
itemRoutes.patch("/:id", validateBody(updateQueueItemSchema), async (c) => {
	try {
		const id = c.req.param("id");
		const input = c.get("validatedBody") as Parameters<
			typeof queueItemService.updateQueueItem
		>[1];

		// Get existing item for SSE broadcast
		const existing = await queueItemService.getQueueItemById(id);
		if (!existing) {
			return c.json(notFoundResponse("Queue item", id), 404);
		}

		const item = await queueItemService.updateQueueItem(id, input);

		if (!item) {
			return c.json(notFoundResponse("Queue item", id), 404);
		}

		// Broadcast SSE event
		sseBroadcaster.broadcast({
			type: "item_updated",
			data: item,
			sessionId: existing.sessionId,
		});

		return c.json(successResponse(item, "Queue item updated successfully"));
	} catch (error) {
		console.error("[ItemRoutes] PATCH /items/:id error:", error);
		return c.json(internalErrorResponse(error), 500);
	}
});

/**
 * PATCH /items/{id}/status
 * Update queue item status specifically
 */
itemRoutes.patch("/:id/status", async (c) => {
	try {
		const id = c.req.param("id");
		const body = await c.req.json();
		const statusId = body.statusId;

		if (!statusId) {
			return c.json(validationErrorResponse("statusId is required"), 400);
		}

		// Get existing item
		const existing = await queueItemService.getQueueItemById(id);
		if (!existing) {
			return c.json(notFoundResponse("Queue item", id), 404);
		}

		// Update only status
		const item = await queueItemService.updateQueueItem(id, { statusId });

		if (!item) {
			return c.json(notFoundResponse("Queue item", id), 404);
		}

		// Broadcast item_status_changed event
		sseBroadcaster.broadcast({
			type: "item_status_changed",
			data: item,
			sessionId: existing.sessionId,
		});

		return c.json(successResponse(item, "Item status updated successfully"));
	} catch (error) {
		console.error("[ItemRoutes] PATCH /items/:id/status error:", error);
		return c.json(internalErrorResponse(error), 500);
	}
});

/**
 * DELETE /items/{id}
 * Delete a queue item
 */
itemRoutes.delete("/:id", async (c) => {
	try {
		const id = c.req.param("id");

		// Get existing item for SSE broadcast
		const existing = await queueItemService.getQueueItemById(id);
		if (!existing) {
			return c.json(notFoundResponse("Queue item", id), 404);
		}

		const deleted = await queueItemService.deleteQueueItem(id);

		if (!deleted) {
			return c.json(notFoundResponse("Queue item", id), 404);
		}

		// Broadcast SSE event
		sseBroadcaster.broadcast({
			type: "item_deleted",
			data: { id },
			sessionId: existing.sessionId,
		});

		return c.json(successResponse({ id }, "Queue item deleted successfully"));
	} catch (error) {
		console.error("[ItemRoutes] DELETE /items/:id error:", error);
		return c.json(internalErrorResponse(error), 500);
	}
});
