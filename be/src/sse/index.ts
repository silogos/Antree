import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { Hono } from "hono";
import { db } from "../db/index.js";
import { queueItems, queueSessions } from "../db/schema.js";
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
 * Check if user has access to session
 */
async function hasSessionAccess(sessionId: string): Promise<boolean> {
  try {
    const sessions = await db
      .select()
      .from(queueSessions)
      .where(eq(queueSessions.id, sessionId))
      .limit(1);
    return sessions.length > 0;
  } catch (error) {
    console.error("[SSE] Error checking session access:", error);
    return false;
  }
}

/**
 * Check if queue item exists
 */
async function hasItemAccess(itemId: string): Promise<boolean> {
  try {
    const items = await db.select().from(queueItems).where(eq(queueItems.id, itemId)).limit(1);
    return items.length > 0;
  } catch (error) {
    console.error("[SSE] Error checking item access:", error);
    return false;
  }
}

/**
 * GET /sessions/:sessionId/stream
 * SSE endpoint for real-time session updates
 */
sseRoutes.get("/sessions/:sessionId/stream", async (c) => {
  const sessionId = c.req.param("sessionId");

  if (!sessionId) {
    return c.json({ success: false, error: "sessionId is required" }, 400);
  }

  // Check authentication
  // Uncomment to enable authentication
  // if (!isAuthenticated(c)) {
  //   return c.json({ success: false, error: 'Unauthorized' }, 401);
  // }

  // Check session access
  const hasAccess = await hasSessionAccess(sessionId);
  if (!hasAccess) {
    return c.json({ success: false, error: "Session not found" }, 404);
  }

  const clientId = generateClientId();
  const lastEventId = c.req.header("Last-Event-ID"); // Support client reconnection
  const signal = c.req.raw.signal; // Get request signal for disconnect detection

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Add connection to broadcaster (will return false if limit reached)
      const connectionAdded = sseBroadcaster.addConnection(
        sessionId,
        controller,
        clientId,
        lastEventId
      );
      if (!connectionAdded) {
        console.warn(`[SSE] Connection rejected for client ${clientId} - limit reached`);
        controller.enqueue(
          `event: error\ndata: ${JSON.stringify({
            type: "error",
            data: null,
            timestamp: new Date().toISOString(),
            message: "Connection limit reached for this batch",
          })}\n\n`
        );
        controller.close();
        return;
      }

      // Send initial connection message
      controller.enqueue(
        `id: ${clientId}\nevent: connected\ndata: ${JSON.stringify({
          type: "connected",
          sessionId,
          clientId,
          timestamp: new Date().toISOString(),
        })}\n\n`
      );

      // Send heartbeat every 30 seconds to keep connection alive
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(`: keep-alive\n\n`);
          sseBroadcaster.updateActivity(sessionId, clientId);
        } catch (error) {
          console.error(`[SSE] Heartbeat error for client ${clientId}:`, error);
          clearInterval(heartbeatInterval);
          sseBroadcaster.removeConnection(sessionId, clientId);
        }
      }, 30000);

      // Set up abort handler for disconnect detection
      const abortHandler = () => {
        console.log(`[SSE] Client ${clientId} disconnected (abort signal)`);
        clearInterval(heartbeatInterval);
        sseBroadcaster.removeConnection(sessionId, clientId);
      };

      signal.addEventListener("abort", abortHandler);

      // Cleanup on stream close
      return () => {
        clearInterval(heartbeatInterval);
        signal.removeEventListener("abort", abortHandler);
        sseBroadcaster.removeConnection(sessionId, clientId);
        console.log(`[SSE] Stream closed for client ${clientId}`);
      };
    },
    cancel() {
      console.log(`[SSE] Stream cancelled for client ${clientId}`);
      sseBroadcaster.removeConnection(sessionId, clientId);
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

/**
 * GET /items/:itemId/stream
 * SSE endpoint for real-time queue item updates
 */
sseRoutes.get("/items/:itemId/stream", async (c) => {
  const itemId = c.req.param("itemId");

  if (!itemId) {
    return c.json({ success: false, error: "itemId is required" }, 400);
  }

  // Check authentication
  // Uncomment to enable authentication
  // if (!_isAuthenticated(c)) {
  //   return c.json({ success: false, error: 'Unauthorized' }, 401);
  // }

  // Check item access
  const hasAccess = await hasItemAccess(itemId);
  if (!hasAccess) {
    return c.json({ success: false, error: "Queue item not found" }, 404);
  }

  // Get the item to find its session
  const item = await db.select().from(queueItems).where(eq(queueItems.id, itemId)).limit(1);

  if (!item || item.length === 0) {
    return c.json({ success: false, error: "Queue item not found" }, 404);
  }

  const sessionId = item[0].sessionId;
  const clientId = generateClientId();
  const lastEventId = c.req.header("Last-Event-ID"); // Support client reconnection
  const signal = c.req.raw.signal; // Get request signal for disconnect detection

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Add connection to broadcaster for item's session
      const connectionAdded = sseBroadcaster.addConnection(
        sessionId,
        controller,
        clientId,
        lastEventId
      );
      if (!connectionAdded) {
        console.warn(`[SSE] Connection rejected for client ${clientId} - limit reached`);
        controller.enqueue(
          `event: error\ndata: ${JSON.stringify({
            type: "error",
            data: null,
            timestamp: new Date().toISOString(),
            message: "Connection limit reached for this batch",
          })}\n\n`
        );
        controller.close();
        return;
      }

      // Send initial connection message
      controller.enqueue(
        `id: ${clientId}\nevent: connected\ndata: ${JSON.stringify({
          type: "connected",
          sessionId,
          clientId,
          timestamp: new Date().toISOString(),
        })}\n\n`
      );

      // Send heartbeat every 30 seconds to keep connection alive
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(`: keep-alive\n\n`);
          sseBroadcaster.updateActivity(sessionId, clientId);
        } catch (error) {
          console.error(`[SSE] Heartbeat error for client ${clientId}:`, error);
          clearInterval(heartbeatInterval);
          sseBroadcaster.removeConnection(sessionId, clientId);
        }
      }, 30000);

      // Set up abort handler for disconnect detection
      const abortHandler = () => {
        console.log(`[SSE] Client ${clientId} disconnected (abort signal)`);
        clearInterval(heartbeatInterval);
        sseBroadcaster.removeConnection(sessionId, clientId);
      };

      signal.addEventListener("abort", abortHandler);

      // Cleanup on stream close
      return () => {
        clearInterval(heartbeatInterval);
        signal.removeEventListener("abort", abortHandler);
        sseBroadcaster.removeConnection(sessionId, clientId);
        console.log(`[SSE] Stream closed for client ${clientId}`);
      };
    },
    cancel() {
      console.log(`[SSE] Stream cancelled for client ${clientId}`);
      sseBroadcaster.removeConnection(sessionId, clientId);
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
