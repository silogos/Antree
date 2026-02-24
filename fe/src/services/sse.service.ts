/**
 * SSE Client with Infinite Reconnection and Exponential Backoff
 */

import type { SSEEventType } from "../types";
import { API_BASE_URL } from "../types/http.types";

declare global {
  interface GlobalThis {
    __sseClientInstance?: SSEClient;
  }
}

/**
 * SSE Event Structure
 */
export interface SSEEvent<T = unknown> {
  type: SSEEventType | "connected";
  data: T;
  timestamp: string;
}

interface SSEClientOptions {
  onMessage?: (event: SSEEvent) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onReconnecting?: (attempt: number, delay: number) => void;
  // Reconnection configuration
  maxReconnectDelay?: number; // Max delay between reconnections (default: 30s)
  initialReconnectDelay?: number; // Initial delay before first reconnect (default: 1s)
}

export class SSEClient {
  private eventSource: EventSource | null = null;
  private batchId: string | null = null;
  private sessionId: string | null = null;
  private url: string | null = null;
  private options: SSEClientOptions = {};

  // Reconnection state
  private reconnectAttempts = 0;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private isManualDisconnect = false;
  private readonly initialReconnectDelay: number;
  private readonly maxReconnectDelay: number;

  constructor() {
    this.initialReconnectDelay = 1000; // 1 second
    this.maxReconnectDelay = 30000; // 30 seconds
  }

  /**
   * Calculate exponential backoff delay with jitter
   */
  private calculateReconnectDelay(): number {
    // Exponential backoff: initialDelay * (2 ^ attempt)
    const exponentialDelay = this.initialReconnectDelay * 2 ** this.reconnectAttempts;

    // Add jitter: random value between 0-1000ms
    const jitter = Math.random() * 1000;

    // Cap at max delay
    return Math.min(exponentialDelay + jitter, this.maxReconnectDelay);
  }

  /**
   * Universal internal connect method
   */
  private internalConnect(url: string, isSession: boolean, id: string): void {
    this.cleanup(); // Stop any existing connections or pending reconnects
    this.url = url;
    this.isManualDisconnect = false;

    console.log(`[SSE Client] Connecting to ${url}`);

    try {
      this.eventSource = new EventSource(url);

      this.eventSource.onopen = () => {
        console.log(`[SSE Client] Connected to ${isSession ? "session" : "batch"} ${id}`);
        // Reset reconnect attempts on successful connection
        this.reconnectAttempts = 0;
        this.options.onOpen?.();
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data: SSEEvent = JSON.parse(event.data);
          this.options.onMessage?.(data);
        } catch (error) {
          console.error("[SSE Client] Failed to parse event:", error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error("[SSE Client] Connection Error:", error);

        // Check if this is a manual disconnect
        if (this.isManualDisconnect) {
          console.log("[SSE Client] Manual disconnect, not reconnecting");
          this.options.onClose?.();
          return;
        }

        this.options.onError?.(error);
        this.scheduleReconnect(isSession, id);
      };
    } catch (error) {
      console.error("[SSE Client] Failed to create EventSource:", error);
      this.scheduleReconnect(isSession, id);
    }
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect(isSession: boolean, id: string): void {
    // Clear any existing timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    // Calculate delay
    const delay = this.calculateReconnectDelay();
    this.reconnectAttempts++;

    console.log(
      `[SSE Client] Reconnecting in ${delay.toFixed(0)}ms (attempt #${this.reconnectAttempts})`
    );

    // Notify listeners about reconnection attempt
    this.options.onReconnecting?.(this.reconnectAttempts, delay);

    // Schedule reconnection
    this.reconnectTimeout = setTimeout(() => {
      if (!this.isManualDisconnect && this.url) {
        console.log(`[SSE Client] Attempting reconnection #${this.reconnectAttempts}`);
        this.internalConnect(this.url, isSession, id);
      }
    }, delay);
  }

  /**
   * Stops active connection and clears any pending reconnection timers
   */
  private cleanup(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  /**
   * Connect via Batch ID
   */
  connect(batchId: string, options: SSEClientOptions = {}): void {
    this.batchId = batchId;
    this.sessionId = null;
    this.options = options;

    const baseUrl = API_BASE_URL.replace(/\/api$/, "");
    const url = `${baseUrl}/sse/batches/${batchId}/events`;
    this.internalConnect(url, false, batchId);
  }

  /**
   * Connect via Session ID
   */
  connectSession(sessionId: string, options: SSEClientOptions = {}): void {
    this.sessionId = sessionId;
    this.batchId = null;
    this.options = options;

    const baseUrl = API_BASE_URL.replace(/\/api$/, "");
    const url = `${baseUrl}/sessions/${sessionId}/stream`;
    this.internalConnect(url, true, sessionId);
  }

  /**
   * Disconnect and stop reconnection attempts
   */
  disconnect(): void {
    console.log(`[SSE Client] Manual disconnect triggered`);
    this.isManualDisconnect = true;
    this.cleanup();
    this.batchId = null;
    this.sessionId = null;
    this.url = null;
    this.reconnectAttempts = 0;
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }

  /**
   * Get current batch ID
   */
  getBatchId() {
    return this.batchId;
  }

  /**
   * Get current session ID
   */
  getSessionId() {
    return this.sessionId;
  }

  /**
   * Get current reconnection attempt count
   */
  getReconnectAttempts() {
    return this.reconnectAttempts;
  }
}

/**
 * Singleton instance management
 */
const getGlobalInstance = (): SSEClient => {
  if (!globalThis.__sseClientInstance) {
    globalThis.__sseClientInstance = new SSEClient();
  }
  return globalThis.__sseClientInstance;
};

export const getSSEClient = () => getGlobalInstance();

// Auto-cleanup on tab close
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    getGlobalInstance().disconnect();
  });

  // Handle page visibility changes - pause reconnection when tab is hidden
  document.addEventListener("visibilitychange", () => {
    const client = getGlobalInstance();
    if (document.hidden) {
      // Tab is hidden, disconnect to save resources
      if (client.isConnected()) {
        console.log("[SSE Client] Tab hidden, disconnecting");
        client.disconnect();
      }
    } else {
      // Tab is visible again, reconnect if we had a session/batch
      const sessionId = client.getSessionId();
      const batchId = client.getBatchId();

      if (sessionId) {
        console.log("[SSE Client] Tab visible, reconnecting to session");
        client.connectSession(sessionId, client.options);
      } else if (batchId) {
        console.log("[SSE Client] Tab visible, reconnecting to batch");
        client.connect(batchId, client.options);
      }
    }
  });
}
