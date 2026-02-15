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
  type: 'queue_created' | 'queue_updated' | 'queue_deleted' | 'status_created' | 'status_updated' | 'status_deleted' | 'board_updated' | 'board_deleted';
  data: unknown;
  boardId: string;
}

class SSEBroadcaster {
  private connections: Map<string, SSEConnection[]> = new Map(); // boardId -> connections

  /**
   * Add a new SSE connection for a board
   */
  addConnection(boardId: string, controller: ReadableStreamDefaultController, clientId: string): void {
    if (!this.connections.has(boardId)) {
      this.connections.set(boardId, []);
    }
    this.connections.get(boardId)!.push({ boardId, controller, clientId });
    console.log(`[SSE] Client ${clientId} connected to board ${boardId}`);
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
        console.log(`[SSE] Client ${clientId} disconnected from board ${boardId}`);
      }

      // Clean up empty board arrays
      if (boardConnections.length === 0) {
        this.connections.delete(boardId);
      }
    }
  }

  /**
   * Broadcast an event to all clients connected to a board
   */
  broadcast(event: SSEEvent): void {
    const boardConnections = this.connections.get(event.boardId);
    if (!boardConnections || boardConnections.length === 0) {
      return;
    }

    const eventData = {
      type: event.type,
      data: event.data,
      timestamp: new Date().toISOString(),
    };

    const message = `data: ${JSON.stringify(eventData)}\n\n`;

    // Send to all connections for this board
    boardConnections.forEach(conn => {
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
