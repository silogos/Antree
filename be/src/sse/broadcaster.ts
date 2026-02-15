/**
 * SSE (Server-Sent Events) Broadcaster
 * Manages real-time event streaming for board updates
 */

interface SSEConnection {
  boardId: string;
  controller: ReadableStreamDefaultController;
  clientId: string;
}

interface SSEEvent {
  type:
    | 'queue_created' | 'queue_updated' | 'queue_deleted' // Queue (new) events
    | 'batch_created' | 'batch_updated' | 'batch_deleted' // Batch events
    | 'queue_item_created' | 'queue_item_updated' | 'queue_item_deleted' // Queue item events (renamed from queue_*)
    | 'status_created' | 'status_updated' | 'status_deleted'
    | 'board_updated' | 'board_deleted'
    | 'template_created' | 'template_updated' | 'template_deleted';
  data: unknown;
  boardId?: string;  // Legacy support
  batchId?: string;   // Batch ID
  queueId?: string;   // Queue ID
}

class SSEBroadcaster {
  private connections: Map<string, SSEConnection[]> = new Map(); // boardId/batchId -> connections

  /**
   * Add a new SSE connection for a board or batch
   */
  addConnection(boardId: string, controller: ReadableStreamDefaultController, clientId: string): void {
    if (!this.connections.has(boardId)) {
      this.connections.set(boardId, []);
    }
    this.connections.get(boardId)!.push({ boardId, controller, clientId });
    console.log(`[SSE] Client ${clientId} connected to board/batch ${boardId}`);
  }

  /**
   * Remove an SSE connection
   */
  removeConnection(boardId: string, clientId: string): void {
    const boardConnections = this.connections.get(boardId);
    if (boardConnections) {
      const index = boardConnections.findIndex(conn => conn.clientId === clientId);
      if (index !== -1) {
        boardConnections.splice(index, 1);
        console.log(`[SSE] Client ${clientId} disconnected from board/batch ${boardId}`);
      }

      // Clean up empty board arrays
      if (boardConnections.length === 0) {
        this.connections.delete(boardId);
      }
    }
  }

  /**
   * Broadcast an event to all clients connected to a board, batch, or queue
   */
  broadcast(event: SSEEvent): void {
    // Support queueId (new), batchId (new flow), and boardId (legacy)
    const targetId = event.queueId || event.batchId || event.boardId;
    if (!targetId) {
      console.warn('[SSE] Broadcast called without queueId, batchId, or boardId');
      return;
    }

    const connections = this.connections.get(targetId);
    if (!connections || connections.length === 0) {
      return;
    }

    const eventData = {
      type: event.type,
      data: event.data,
      timestamp: new Date().toISOString(),
    };

    const message = `data: ${JSON.stringify(eventData)}\n\n`;

    // Send to all connections for this queue/batch/board
    connections.forEach(conn => {
      try {
        conn.controller.enqueue(message);
      } catch (error) {
        console.error(`[SSE] Error sending to client ${conn.clientId}:`, error);
        // Remove broken connection
        this.removeConnection(conn.boardId, conn.clientId);
      }
    });
  }

  /**
   * Get connection count for a board
   */
  getConnectionCount(boardId: string): number {
    return this.connections.get(boardId)?.length || 0;
  }

  /**
   * Get total connection count across all boards
   */
  getTotalConnectionCount(): number {
    let total = 0;
    this.connections.forEach(conns => {
      total += conns.length;
    });
    return total;
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
