/**
 * Queues Routes
 * API endpoints for queue management
 */

import { Hono } from "hono";
import {
	internalErrorResponse,
	notFoundResponse,
	successResponse,
} from "../middleware/response.js";
import { validateBody } from "../middleware/validation.js";
import { queueService } from "../services/queue.service.js";
import { sessionService } from "../services/session.service.js";
import { sseBroadcaster } from "../sse/broadcaster.js";
import {
	createQueueSchema,
	updateQueueSchema,
} from "../validators/queue.validator.js";
import { createSessionSchema } from "../validators/session.validator.js";

export const queuesRoutes = new Hono();

/**
 * GET /queues
 * Get all queues
 */
queuesRoutes.get("/", async (c) => {
	try {
		const queues = await queueService.getAllQueues();
		return c.json(successResponse(queues, undefined, queues.length));
	} catch (error) {
		console.error("[QueuesRoutes] GET /queues error:", error);
		return c.json(internalErrorResponse(error), 500);
	}
});

/**
 * GET /queues/:id
 * Get a single queue
 */
queuesRoutes.get("/:id", async (c) => {
	try {
		const id = c.req.param("id");
		const queue = await queueService.getQueueById(id);

		if (!queue) {
			return c.json(notFoundResponse("Queue", id), 404);
		}

		return c.json(successResponse(queue));
	} catch (error) {
		console.error("[QueuesRoutes] GET /queues/:id error:", error);
		return c.json(internalErrorResponse(error), 500);
	}
});

/**
 * POST /queues
 * Create a new queue
 */
queuesRoutes.post("/", validateBody(createQueueSchema), async (c) => {
	try {
		const input = c.get("validatedBody") as Parameters<
			typeof queueService.createQueue
		>[0];
		const queue = await queueService.createQueue(input);

		if (!queue) {
			return c.json(notFoundResponse("Template", input.templateId), 404);
		}

		return c.json(successResponse(queue, "Queue created successfully"), 201);
	} catch (error) {
		console.error("[QueuesRoutes] POST /queues error:", error);
		return c.json(internalErrorResponse(error), 500);
	}
});

/**
 * PATCH /queues/:id
 * Update a queue (soft deactivate by setting is_active to false)
 */
queuesRoutes.patch("/:id", validateBody(updateQueueSchema), async (c) => {
	try {
		const id = c.req.param("id");
		const input = c.get("validatedBody") as Parameters<
			typeof queueService.updateQueue
		>[1];
		const queue = await queueService.updateQueue(id, input);

		if (!queue) {
			return c.json(notFoundResponse("Queue", id), 404);
		}

		return c.json(successResponse(queue, "Queue updated successfully"));
	} catch (error) {
		console.error("[QueuesRoutes] PATCH /queues/:id error:", error);
		return c.json(internalErrorResponse(error), 500);
	}
});

/**
 * DELETE /queues/:id
 * Delete a queue (soft delete by setting is_active to false)
 */
queuesRoutes.delete("/:id", async (c) => {
	try {
		const id = c.req.param("id");
		const deleted = await queueService.deleteQueue(id);

		if (!deleted) {
			return c.json(notFoundResponse("Queue", id), 404);
		}

		return c.json(successResponse({ id }, "Queue deleted successfully"));
	} catch (error) {
		console.error("[QueuesRoutes] DELETE /queues/:id error:", error);
		return c.json(internalErrorResponse(error), 500);
	}
});

/**
 * GET /queues/:queueId/sessions
 * Get all sessions for a queue (excludes soft-deleted sessions)
 */
queuesRoutes.get("/:queueId/sessions", async (c) => {
	try {
		const queueId = c.req.param("queueId");
		const status = c.req.query("status") as
			| "active"
			| "paused"
			| "completed"
			| "archived"
			| undefined;

		// Verify queue exists
		const queue = await queueService.getQueueById(queueId);
		if (!queue) {
			return c.json(notFoundResponse("Queue", queueId), 404);
		}

		const sessions = await sessionService.getAllSessions({
			queueId,
			status: status as any,
		});
		return c.json(successResponse(sessions, undefined, sessions.length));
	} catch (error) {
		console.error("[QueuesRoutes] GET /queues/:queueId/sessions error:", error);
		return c.json(internalErrorResponse(error), 500);
	}
});

/**
 * POST /queues/:queueId/sessions
 * Create a new session for a queue
 */
queuesRoutes.post(
	"/:queueId/sessions",
	validateBody(createSessionSchema),
	async (c) => {
		try {
			const queueId = c.req.param("queueId");
			const input = c.get("validatedBody") as Parameters<
				typeof sessionService.createSession
			>[0];

			// Verify queue exists
			const queue = await queueService.getQueueById(queueId);
			if (!queue) {
				return c.json(notFoundResponse("Queue", queueId), 404);
			}

			// Override queueId and templateId from path
			const sessionInput = {
				...input,
				queueId,
				templateId: queue.templateId,
			};

			const session = await sessionService.createSession(sessionInput);

			if (!session) {
				return c.json(notFoundResponse("Template", queue.template_id), 404);
			}

			// Broadcast SSE event
			sseBroadcaster.broadcast({
				type: "session_created",
				data: session,
				queueId: queueId,
			});

			return c.json(
				successResponse(
					session,
					"Session created successfully with copied statuses",
				),
				201,
			);
		} catch (error) {
			console.error(
				"[QueuesRoutes] POST /queues/:queueId/sessions error:",
				error,
			);
			return c.json(internalErrorResponse(error), 500);
		}
	},
);
