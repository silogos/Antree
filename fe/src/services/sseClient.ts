import type { SSEEventType } from "../types";
import { API_BASE_URL } from "./api";

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
}

export class SSEClient {
  private eventSource: EventSource | null = null;
  private batchId: string | null = null;
  private sessionId: string | null = null;
  private options: SSEClientOptions = {};

  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  /**
   * Universal internal connect method
   */
  private internalConnect(url: string, isSession: boolean, id: string): void {
    this.cleanup(); // Stop any existing connections or pending reconnects

    console.log(`[SSE Client] Connecting to ${url}`);
    this.eventSource = new EventSource(url);

    this.eventSource.onopen = () => {
      console.log(
        `[SSE Client] Connected to ${isSession ? "session" : "batch"} ${id}`,
      );
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
      this.options.onError?.(error);
      this.handleReconnect(isSession, id);
    };
  }

  private handleReconnect(isSession: boolean, id: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * this.reconnectAttempts;

      console.log(
        `[SSE Client] Reconnecting in ${delay}ms (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
      );

      this.reconnectTimeout = setTimeout(() => {
        if (isSession && this.sessionId) {
          this.connectSession(this.sessionId, this.options);
        } else if (!isSession && this.batchId) {
          this.connect(this.batchId, this.options);
        }
      }, delay);
    } else {
      console.error("[SSE Client] Max reconnect attempts reached");
      this.disconnect();
      this.options.onClose?.();
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

  disconnect(): void {
    console.log(`[SSE Client] Manual disconnect triggered`);
    this.cleanup();
    this.batchId = null;
    this.sessionId = null;
    this.reconnectAttempts = 0;
  }

  isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }

  getBatchId() {
    return this.batchId;
  }
  getSessionId() {
    return this.sessionId;
  }
}

/**
 * Singleton instance management
 */
const getGlobalInstance = (): SSEClient => {
  const key = "__sseClientInstance";
  if (!(globalThis as any)[key]) {
    (globalThis as any)[key] = new SSEClient();
  }
  return (globalThis as any)[key];
};

export const getSSEClient = () => getGlobalInstance();

// Auto-cleanup on tab close
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    getGlobalInstance().disconnect();
  });
}
