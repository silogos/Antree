import { Hono } from 'hono';
import { sseBroadcaster, generateClientId } from './broadcaster.js';

export const sseRoutes = new Hono();

/**
 * GET /boards/:boardId/events
 * SSE endpoint for real-time board updates
 */
sseRoutes.get('/boards/:boardId/events', async (c) => {
  const boardId = c.req.param('boardId');

  if (!boardId) {
    return c.json({ success: false, error: 'boardId is required' }, 400);
  }

  const clientId = generateClientId();

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(`data: ${JSON.stringify({
        type: 'connected',
        clientId,
        boardId,
        timestamp: new Date().toISOString()
      })}\n\n`);

      // Add connection to broadcaster
      sseBroadcaster.addConnection(boardId, controller, clientId);

      // Send heartbeat every 30 seconds to keep connection alive
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(`: keep-alive\n\n`);
        } catch (error) {
          console.error(`[SSE] Heartbeat error for client ${clientId}:`, error);
          clearInterval(heartbeatInterval);
        }
      }, 30000);

      // Cleanup on stream close
      return () => {
        clearInterval(heartbeatInterval);
        sseBroadcaster.removeConnection(boardId, clientId);
        console.log(`[SSE] Stream closed for client ${clientId}`);
      };
    },
    cancel() {
      sseBroadcaster.removeConnection(boardId, clientId);
    }
  });

  // Set SSE headers
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
});
