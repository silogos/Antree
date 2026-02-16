import type { SSEEventType } from "../types";
import { API_BASE_URL } from "./board.service";

/**
 * SSE Client Options
 */
interface SSEClientOptions {
  onMessage?: (event: SSEEvent) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

/**
 * SSE Event
 */
export interface SSEEvent<T = unknown> {
  type: SSEEventType;
  data: T;
  timestamp: string;
}

type EventCallback<T = unknown> = (event: SSEEvent<T>) => void;
type ErrorHandler = (error: Event) => void;
type ConnectionHandler = () => void;

/**
 * SSE Client Options
 */
interface SSEClientOptions {
  onMessage?: EventCallback;
  onError?: ErrorHandler;
  onOpen?: ConnectionHandler;
  onClose?: ConnectionHandler;
}

/**
 * SSE Client for real-time batch updates
 */
export class SSEClient {
  private eventSource: EventSource | null = null;
  private batchId: string | null = null;
  private options: SSEClientOptions = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // 3 seconds

  /**
   * Connect to SSE endpoint for a batch
   */
  connect(batchId: string, options: SSEClientOptions = {}): void {
    this.disconnect();
    this.batchId = batchId;
    this.options = options;
    this.reconnectAttempts = 0;

    const url = `${API_BASE_URL.replace("/api", "")}/sse/batches/${batchId}/events`;
    console.log(`[SSE Client] Connecting to ${url}`);

    this.eventSource = new EventSource(url);

    this.eventSource.onopen = () => {
      console.log(`[SSE Client] Connected to batch ${batchId}`);
      this.reconnectAttempts = 0;
      options.onOpen?.();
    };

    this.eventSource.onmessage = (event) => {
      try {
        const data: SSEEvent = JSON.parse(event.data);
        console.log(`[SSE Client] Received event:`, data.type);
        options.onMessage?.(data);
      } catch (error) {
        console.error("[SSE Client] Failed to parse event:", error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error("[SSE Client] Error:", error);
      options.onError?.(error);

      // Attempt to reconnect
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * this.reconnectAttempts;
        console.log(
          `[SSE Client] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
        );

        setTimeout(() => {
          if (this.batchId) {
            this.connect(this.batchId, this.options);
          }
        }, delay);
      } else {
        console.error("[SSE Client] Max reconnect attempts reached");
        this.disconnect();
        options.onClose?.();
      }
    };
  }

  /**
   * Disconnect from SSE endpoint
   */
  disconnect(): void {
    if (this.eventSource) {
      console.log(`[SSE Client] Disconnecting from batch ${this.batchId}`);
      this.eventSource.close();
      this.eventSource = null;
      this.batchId = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return (
      this.eventSource !== null &&
      this.eventSource.readyState === EventSource.OPEN
    );
  }

  /**
   * Get current batch ID
   */
  getBatchId(): string | null {
    return this.batchId;
  }
}

/**
 * Singleton SSE Client instance
 */
let sseClientInstance: SSEClient | null = null;

/**
 * Get or create SSE Client instance
 */
export function getSSEClient(): SSEClient {
  if (!sseClientInstance) {
    sseClientInstance = new SSEClient();
  }
  return sseClientInstance;

  // Cleanup on page unload
  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", () => {
      sseClientInstance?.disconnect();
    });
  }
}
