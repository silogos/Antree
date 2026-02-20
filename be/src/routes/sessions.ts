/**
 * Session Routes
 * API endpoints for session management
 */

import { eq } from "drizzle-orm";
import { Hono } from "hono";
// Imports for PATCH /session-statuses/{id}
import { db } from "../db/index.js";
import { queueSessionStatuses } from "../db/schema.js";
import {
	internalErrorResponse,
	notFoundResponse,
	successResponse,
} from "../middleware/response.js";
import { validateBody } from "../middleware/validation.js";
import { sessionService } from "../services/session.service.js";
import { sseBroadcaster } from "../sse/broadcaster.js";
import {
	createSessionSchema,
	lifecycleUpdateSchema,
	updateSessionSchema,
} from "../validators/session.validator.js";

export const sessionRoutes = new Hono();

/**
 * GET /sessions
 * Get all sessions
 */
sessionRoutes.get("/", async (c) => {
	try {
		const queueId = c.req.query("queueId");
		const status = c.req.query("status") as
			| "active"
			| "paused"
			| "completed"
			| "archived"
			| undefined;

		const filters = {
			queueId,
			status,
		};

		const sessions = await sessionService.getAllSessions(filters);
		return c.json(successResponse(sessions, undefined, sessions.length));
	} catch (error) {
		console.error("[SessionRoutes] GET /sessions error:", error);
		return c.json(internalErrorResponse(error), 500);
	}
});

/**
 * GET /sessions/:id
 * Get a single session
 */
sessionRoutes.get("/:id", async (c) => {
	try {
		const id = c.req.param("id");
		const session = await sessionService.getSessionById(id);

		if (!session) {
			return c.json(notFoundResponse("Session", id), 404);
		}

		return c.json(successResponse(session));
	} catch (error) {
		console.error("[SessionRoutes] GET /sessions/:id error:", error);
		return c.json(internalErrorResponse(error), 500);
	}
});

/**
 * GET /sessions/:id/statuses
 * Get all statuses for a session
 */
sessionRoutes.get("/:id/statuses", async (c) => {
	try {
		const id = c.req.param("id");
		const statuses = await sessionService.getSessionStatuses(id);

		if (!statuses || statuses.length === 0) {
			return c.json(successResponse([], "No statuses found for this session"));
		}

		return c.json(successResponse(statuses));
	} catch (error) {
		console.error("[SessionRoutes] GET /sessions/:id/statuses error:", error);
		return c.json(internalErrorResponse(error), 500);
	}
});

/**
 * POST /sessions
 * Create a new session (copies statuses from template)
 */
sessionRoutes.post("/", validateBody(createSessionSchema), async (c) => {
	try {
		const input = c.get("validatedBody") as Parameters<
			typeof sessionService.createSession
		>[0];
		const session = await sessionService.createSession(input);

		if (!session) {
			return c.json(successResponse(null, "Queue not found"), 404);
		}

		// Broadcast SSE event
		sseBroadcaster.broadcast({
			type: "session_created",
			data: session,
			sessionId: input.queueId,
		});

		return c.json(
			successResponse(
				session,
				"Session created successfully with copied statuses",
			),
			201,
		);
	} catch (error) {
		console.error("[SessionRoutes] POST /sessions error:", error);
		return c.json(internalErrorResponse(error), 500);
	}
});

/**
 * PATCH /sessions/:id
 * Update a session
 */
sessionRoutes.patch("/:id", validateBody(updateSessionSchema), async (c) => {
	try {
		const id = c.req.param("id");
		const input = c.get("validatedBody") as Parameters<
			typeof sessionService.updateSession
		>[1];
		const session = await sessionService.updateSession(id, input);

		if (!session) {
			return c.json(notFoundResponse("Session", id), 404);
		}

		// Broadcast SSE event
		sseBroadcaster.broadcast({
			type: "session_updated",
			data: session,
			sessionId: id,
		});

		return c.json(successResponse(session, "Session updated successfully"));
	} catch (error) {
		console.error("[SessionRoutes] PATCH /sessions/:id error:", error);
		return c.json(internalErrorResponse(error), 500);
	}
});

/**
 * PATCH /sessions/:id/lifecycle
 * Update session lifecycle status (active/paused/completed/archived)
 */
sessionRoutes.patch(
	"/:id/lifecycle",
	validateBody(lifecycleUpdateSchema),
	async (c) => {
		try {
			const id = c.req.param("id");
			const input = c.get("validatedBody") as Parameters<
				typeof sessionService.updateSession
			>[1];
			const session = await sessionService.updateSession(id, input);

			if (!session) {
				return c.json(notFoundResponse("Session", id), 404);
			}

			// Broadcast appropriate SSE event based on status
			const eventType =
				input.status === "paused"
					? "session_paused"
					: input.status === "active"
						? "session_resumed"
						: input.status === "completed"
							? "session_completed"
							: "session_updated";

			sseBroadcaster.broadcast({
				type: eventType,
				data: session,
				sessionId: id,
				queueId: session.queueId ?? undefined,
			});

			return c.json(
				successResponse(session, "Session lifecycle updated successfully"),
			);
		} catch (error) {
			console.error(
				"[SessionRoutes] PATCH /sessions/:id/lifecycle error:",
				error,
			);
			return c.json(internalErrorResponse(error), 500);
		}
	},
);

/**
 * DELETE /sessions/:id
 * Delete a session (soft delete)
 */
sessionRoutes.delete("/:id", async (c) => {
	try {
		const id = c.req.param("id");
		const deleted = await sessionService.deleteSession(id);

		if (!deleted) {
			return c.json(notFoundResponse("Session", id), 404);
		}

		return c.json(successResponse({ id }, "Session deleted successfully"));
	} catch (error) {
		console.error("[SessionRoutes] DELETE /sessions/:id error:", error);
		return c.json(internalErrorResponse(error), 500);
	}
});

/**
 * PATCH /session-statuses/{id}
 * Update a session status properties (label, color, order)
 */
sessionRoutes.patch("/session-statuses/:id", async (c) => {
	try {
		const id = c.req.param("id");
		const body = await c.req.json();

		// Get the session status
		const status = await db
			.select()
			.from(queueSessionStatuses)
			.where(eq(queueSessionStatuses.id, id))
			.limit(1);

		if (!status || status.length === 0) {
			return c.json(notFoundResponse("Session status", id), 404);
		}

		// Build update object
		const updateData: any = {};
		if (body.label !== undefined) updateData.label = body.label;
		if (body.color !== undefined) updateData.color = body.color;
		if (body.order !== undefined) updateData.order = body.order;

		// Update in database
		const result = await db
			.update(queueSessionStatuses)
			.set(updateData)
			.where(eq(queueSessionStatuses.id, id))
			.returning();

		const updated = result[0];

		// Broadcast SSE event
		sseBroadcaster.broadcast({
			type: "session_status_updated",
			data: updated,
			sessionId: updated.sessionId,
		});

		return c.json(
			successResponse(updated, "Session status updated successfully"),
		);
	} catch (error) {
		console.error("[SessionRoutes] PATCH /session-statuses/:id error:", error);
		return c.json(internalErrorResponse(error), 500);
	}
});
