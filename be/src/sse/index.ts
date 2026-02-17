import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { Hono } from "hono";
import { db } from "../db/index.js";
import { queueBatches } from "../db/schema.js";
import { generateClientId, sseBroadcaster } from "./broadcaster.js";

export const sseRoutes = new Hono();

/**
 * Simple authentication check (can be enhanced with proper auth system)
 */
function _isAuthenticated(c: Context): boolean {
	// For now, just check for a simple header
	// TODO: Implement proper JWT or session-based authentication
	const authHeader = c.req.header("Authorization");
	return !!authHeader;
}

/**
 * Check if user has access to the batch
 */
async function hasBatchAccess(batchId: string): Promise<boolean> {
	try {
		const batches = await db
			.select()
			.from(queueBatches)
			.where(eq(queueBatches.id, batchId))
			.limit(1);
		return batches.length > 0;
	} catch (error) {
		console.error("[SSE] Error checking batch access:", error);
		return false;
	}
}

/**
 * GET /batches/:batchId/events
 * SSE endpoint for real-time batch updates
 */
sseRoutes.get("/batches/:batchId/events", async (c) => {
	const batchId = c.req.param("batchId");

	if (!batchId) {
		return c.json({ success: false, error: "batchId is required" }, 400);
	}

	// Check authentication
	// Uncomment to enable authentication
	// if (!isAuthenticated(c)) {
	//   return c.json({ success: false, error: 'Unauthorized' }, 401);
	// }

	// Check batch access
	const hasAccess = await hasBatchAccess(batchId);
	if (!hasAccess) {
		return c.json({ success: false, error: "Batch not found" }, 404);
	}

	const clientId = generateClientId();
	const lastEventId = c.req.header("Last-Event-ID"); // Support client reconnection
	const signal = c.req.raw.signal; // Get request signal for disconnect detection

	// Create a readable stream for SSE
	const stream = new ReadableStream({
		start(controller) {
			// Add connection to broadcaster (will return false if limit reached)
			const connectionAdded = sseBroadcaster.addConnection(
				batchId,
				controller,
				clientId,
				lastEventId,
			);
			if (!connectionAdded) {
				console.warn(
					`[SSE] Connection rejected for client ${clientId} - limit reached`,
				);
				controller.enqueue(
					`event: error\ndata: ${JSON.stringify({
						type: "error",
						data: null,
						timestamp: new Date().toISOString(),
						message: "Connection limit reached for this batch",
					})}\n\n`,
				);
				controller.close();
				return;
			}

			// Send initial connection message
			controller.enqueue(
				`id: ${clientId}\nevent: connected\ndata: ${JSON.stringify({
					type: "connected",
					clientId,
					batchId,
					timestamp: new Date().toISOString(),
				})}\n\n`,
			);

			// Send heartbeat every 30 seconds to keep connection alive
			const heartbeatInterval = setInterval(() => {
				try {
					controller.enqueue(`: keep-alive\n\n`);
					sseBroadcaster.updateActivity(batchId, clientId);
				} catch (error) {
					console.error(`[SSE] Heartbeat error for client ${clientId}:`, error);
					clearInterval(heartbeatInterval);
					sseBroadcaster.removeConnection(batchId, clientId);
				}
			}, 30000);

			// Set up abort handler for disconnect detection
			const abortHandler = () => {
				console.log(`[SSE] Client ${clientId} disconnected (abort signal)`);
				clearInterval(heartbeatInterval);
				sseBroadcaster.removeConnection(batchId, clientId);
			};

			signal.addEventListener("abort", abortHandler);

			// Cleanup on stream close
			return () => {
				clearInterval(heartbeatInterval);
				signal.removeEventListener("abort", abortHandler);
				sseBroadcaster.removeConnection(batchId, clientId);
				console.log(`[SSE] Stream closed for client ${clientId}`);
			};
		},
		cancel() {
			console.log(`[SSE] Stream cancelled for client ${clientId}`);
			sseBroadcaster.removeConnection(batchId, clientId);
		},
	});

	// Set SSE headers with proper timeouts
	return new Response(stream, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			Connection: "keep-alive",
			"X-Accel-Buffering": "no", // Disable nginx buffering
		},
	});
});
