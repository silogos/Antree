/**
 * SSE (Server-Sent Events) Broadcaster
 * Manages real-time event streaming for board updates
 */

import { logger } from "../lib/logger.js";

interface SSEConnection {
	sessionId: string; // Changed from boardId to sessionId for consistency
	controller: ReadableStreamDefaultController;
	clientId: string;
	lastEventId?: string; // Track last event ID for reconnection
	connectedAt: number; // Connection timestamp
	lastActivity: number; // Last activity timestamp
}

interface SSEEvent {
  type:
		| "session_created"
		| "session_updated"
		| "session_closed"
		| "session_deleted"
		| "session_paused"
		| "session_resumed"
		| "session_completed" // Session events
		| "session_status_created"
		| "session_status_updated"
		| "session_status_deleted" // Session status events
		| "queue_item_created"
		| "queue_item_updated"
		| "queue_item_status_changed"
		| "queue_item_deleted" // Queue item events
		| "queue_created"
		| "queue_updated"
		| "queue_deleted" // Queue events
		| "template_created"
		| "template_updated"
		| "template_deleted" // Template events
		| "board_updated"
		| "board_deleted"; // Board events (legacy)
	data: unknown;
	boardId?: string; // Legacy support
	batchId?: string; // Legacy support (deprecated)
	sessionId?: string; // Session ID
	queueId?: string; // Queue ID
	eventId?: string; // Event ID for deduplication
}

class SSEBroadcaster {
	private connections: Map<string, SSEConnection[]> = new Map(); // sessionId -> connections
	private eventHistory: Map<string, SSEEvent[]> = new Map(); // sessionId -> event history
	private maxHistorySize = 1000; // Max events to keep per board
	private connectionLimit = 50; // Max connections per board
	private rateLimitInterval = 60; // Rate limit window in seconds
	private rateLimitMaxMessages = 100; // Max messages per interval
	private clientMessageCounts: Map<
		string,
		{ count: number; resetTime: number }
	> = new Map();

  /**
   * Add a new SSE connection for a board or batch
   */
  addConnection(
    sessionId: string,
    controller: ReadableStreamDefaultController,
    clientId: string,
    lastEventId?: string,
  ): boolean {
    // Check connection limit
    const existingConnections = this.connections.get(sessionId);
    if (
      existingConnections &&
      existingConnections.length >= this.connectionLimit
    ) {
      logger.warn(
        { sessionId, limit: this.connectionLimit },
        "[SSE] Connection limit reached",
      );
      return false;
    }

    if (!this.connections.has(sessionId)) {
      this.connections.set(sessionId, []);
    }

    const now = Date.now();
    this.connections.get(sessionId)?.push({
      sessionId,
      controller,
      clientId,
      lastEventId,
      connectedAt: now,
      lastActivity: now,
    });
    logger.info(
      { clientId, sessionId, lastEventId },
      "[SSE] Client connected",
    );

    // If client has lastEventId, replay missed events
    if (lastEventId) {
      this.replayMissedEvents(sessionId, lastEventId, controller);
    }

    return true;
  }

  /**
   * Remove an SSE connection
   */
  removeConnection(sessionId: string, clientId: string): void {
    const boardConnections = this.connections.get(sessionId);
    if (boardConnections) {
      const index = boardConnections.findIndex(
        (conn) => conn.clientId === clientId,
      );
      if (index !== -1) {
        boardConnections.splice(index, 1);
        logger.info(
          { clientId, sessionId },
          "[SSE] Client disconnected",
        );
      }

      // Clean up empty board arrays
      if (boardConnections.length === 0) {
        this.connections.delete(sessionId);
        // Also clean up event history for this session
        this.eventHistory.delete(sessionId);
      }
    }

    // Clean up rate limit counter for this client
    this.clientMessageCounts.delete(clientId);
  }

  /**
   * Update client's last activity timestamp
   */
  updateActivity(sessionId: string, clientId: string): void {
    const boardConnections = this.connections.get(sessionId);
    if (boardConnections) {
      const conn = boardConnections.find((c) => c.clientId === clientId);
      if (conn) {
        conn.lastActivity = Date.now();
      }
    }
  }

	/**
	 * Broadcast an event to all clients connected to a board, batch, or queue
	 */
	broadcast(event: SSEEvent): void {
		// Support sessionId (new), queueId (new), batchId (legacy), and boardId (legacy)
		const targetId = event.sessionId || event.queueId || event.batchId || event.boardId;
		if (!targetId) {
			logger.warn("[SSE] Broadcast called without target ID");
			return;
		}

		const connections = this.connections.get(targetId);
		if (!connections || connections.length === 0) {
			return;
		}

		// Generate event ID if not provided
		const eventId =
			event.eventId ||
			`evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
		event.eventId = eventId;

		// Store event in history for reconnection
		this.storeEventHistory(targetId, { ...event, eventId });

		const eventData = {
			type: event.type,
			data: event.data,
			timestamp: new Date().toISOString(),
		};

		// Include event ID in SSE format for Last-Event-ID support
		const message = `id: ${eventId}\ndata: ${JSON.stringify(eventData)}\n\n`;

		// Send to all connections for this queue/batch/board
		connections.forEach((conn) => {
			try {
				// Check rate limit
				if (!this.checkRateLimit(conn.clientId)) {
					logger.warn({ clientId: conn.clientId }, "[SSE] Rate limit exceeded");
					return;
				}

				// Send with timeout (using setTimeout to detect hanging connections)
				const sendTimeout = setTimeout(() => {
					logger.warn({ clientId: conn.clientId }, "[SSE] Send timeout, removing connection");
					this.removeConnection(targetId, conn.clientId);
				}, 5000); // 5 second timeout

				try {
					conn.controller.enqueue(message);
					this.updateActivity(targetId, conn.clientId);
					clearTimeout(sendTimeout);
				} catch (error) {
					clearTimeout(sendTimeout);
					throw error;
				}
			} catch (error) {
				logger.error({ clientId: conn.clientId, error }, "[SSE] Error sending to client");
				// Remove broken connection
				this.removeConnection(targetId, conn.clientId);
			}
		});
	}

	/**
	 * Store event in history for reconnection support
	 */
	private storeEventHistory(targetId: string, event: SSEEvent): void {
		if (!this.eventHistory.has(targetId)) {
			this.eventHistory.set(targetId, []);
		}

		const history = this.eventHistory.get(targetId);
		if (history) {
			history.push(event);

			// Trim history if it exceeds max size
			if (history.length > this.maxHistorySize) {
				history.splice(0, history.length - this.maxHistorySize);
			}
		}
	}

	/**
	 * Check if event should be sent to client based on their lastEventId
	 */
	private shouldSendEvent(event: SSEEvent, lastEventId?: string): boolean {
		if (!lastEventId) return true;
		if (!event.eventId) return true;

		// Parse event IDs: evt_<timestamp>_<random>
		const [eventTimestamp] = event.eventId.split("_").slice(1);
		const [lastTimestamp] = lastEventId.split("_").slice(1);

		// Send event if it was created after the client's last event
		return parseInt(eventTimestamp, 10) > parseInt(lastTimestamp, 10);
	}

	/**
	 * Replay missed events to a reconnected client
	 */
	private replayMissedEvents(
		targetId: string,
		lastEventId: string,
		controller: ReadableStreamDefaultController,
	): void {
		const history = this.eventHistory.get(targetId);
		if (!history || history.length === 0) {
			return;
		}

		let replayedCount = 0;
		const eventData = {
			type: "catch_up",
			data: null,
			timestamp: new Date().toISOString(),
		};

		// Send catch-up start message
		controller.enqueue(
			`event: catch_up_start\ndata: ${JSON.stringify({ ...eventData, message: "Replaying missed events" })}\n\n`,
		);

		// Replay events that client missed
		for (const event of history) {
			if (this.shouldSendEvent(event, lastEventId)) {
				const message = `id: ${event.eventId}\nevent: ${event.type}\ndata: ${JSON.stringify(
					{
						type: event.type,
						data: event.data,
						timestamp: new Date().toISOString(),
					},
				)}\n\n`;

				try {
					controller.enqueue(message);
					replayedCount++;
				} catch (error) {
					logger.error({ error }, "[SSE] Error replaying event");
					break;
				}
			}
		}

		// Send catch-up complete message
		controller.enqueue(
			`event: catch_up_complete\ndata: ${JSON.stringify({
				...eventData,
				message: `Replayed ${replayedCount} missed events`,
			})}\n\n`,
		);

		logger.info({ replayedCount }, "[SSE] Replayed events to client");
	}

	/**
	 * Check rate limit for a client
	 */
	private checkRateLimit(clientId: string): boolean {
		const now = Date.now();
		const counter = this.clientMessageCounts.get(clientId);

		if (!counter) {
			this.clientMessageCounts.set(clientId, {
				count: 1,
				resetTime: now + this.rateLimitInterval * 1000,
			});
			return true;
		}

		// Reset counter if interval has passed
		if (now >= counter.resetTime) {
			this.clientMessageCounts.set(clientId, {
				count: 1,
				resetTime: now + this.rateLimitInterval * 1000,
			});
			return true;
		}

		// Check if limit exceeded
		if (counter.count >= this.rateLimitMaxMessages) {
			return false;
		}

		counter.count++;
		return true;
	}

  /**
   * Get connection count for a session
   */
  getConnectionCount(sessionId: string): number {
    return this.connections.get(sessionId)?.length || 0;
  }

	/**
	 * Get total connection count across all boards
	 */
	getTotalConnectionCount(): number {
		let total = 0;
		this.connections.forEach((conns) => {
			total += conns.length;
		});
		return total;
	}

	/**
	 * Get the number of active sessions (sessions with at least one connection)
	 */
	getActiveSessionCount(): number {
		let count = 0;
		this.connections.forEach((conns) => {
			if (conns.length > 0) {
				count++;
			}
		});
		return count;
	}

  /**
   * Close all SSE connections gracefully (for shutdown)
   */
  closeAllConnections(): void {
    const totalConnections = this.getTotalConnectionCount();
    logger.info({ totalConnections }, "[SSE] Closing all SSE connections");

    this.connections.forEach((conns, _sessionId) => {
      conns.forEach((conn) => {
        try {
          // Send disconnect message
          const disconnectMessage = `event: disconnect\ndata: ${JSON.stringify({
            type: "disconnect",
            data: null,
            timestamp: new Date().toISOString(),
            message: "Server shutting down",
          })}\n\n`;
          conn.controller.enqueue(disconnectMessage);

          // Close the stream
          try {
            conn.controller.close();
          } catch (_e) {
            // Controller might already be closed
          }
        } catch (error) {
          logger.error(
            { clientId: conn.clientId, error },
            "[SSE] Error closing connection",
          );
        }
      });
    });

    // Clear all connections
    this.connections.clear();
    this.eventHistory.clear();
    this.clientMessageCounts.clear();

    logger.info("[SSE] All connections closed");
  }

  /**
   * Cleanup idle connections (call periodically)
   */
  cleanupIdleConnections(maxIdleTime: number = 300000): void {
    // 5 minutes default
    const now = Date.now();
    let cleanedCount = 0;

    this.connections.forEach((conns, sessionId) => {
      for (let i = conns.length - 1; i >= 0; i--) {
        const conn = conns[i];
        if (now - conn.lastActivity > maxIdleTime) {
          const idleTime = Math.round((now - conn.lastActivity) / 1000);
          logger.debug(
            { clientId: conn.clientId, sessionId, idleTime },
            "[SSE] Removing idle connection",
          );
          try {
            conn.controller.close();
          } catch (_e) {
            // Controller might already be closed
          }
          conns.splice(i, 1);
          cleanedCount++;
        }
      }

      // Clean up empty session arrays
      if (conns.length === 0) {
        this.connections.delete(sessionId);
      }
    });

    if (cleanedCount > 0) {
      logger.info({ cleanedCount }, "[SSE] Cleaned up idle connections");
    }
  }
}

// Singleton instance
export const sseBroadcaster = new SSEBroadcaster();

/**
 * Generate a unique client ID
 */
export function generateClientId(): string {
	return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
