import { useCallback, useEffect, useState } from "react";
import { getSSEClient, type SSEEvent } from "../services/sse.service";
import type { QueueItem, QueueSession } from "../types";
import { SessionLifecycle } from "../types/queue";

/**
 * Hook for real-time queue updates via SSE
 *
 * Connects to /sessions endpoint and handles:
 * - Queue events: queue_created, queue_updated, queue_deleted
 * - Session lifecycle: session_created, session_updated, session_deleted, session_closed
 *
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * const { isConnected, queues, connect, disconnect } = useQueueSSE({
 *   onQueueCreated: (queue) => console.log('New queue:', queue),
 *   onSessionCreated: (session) => console.log('New session:', session),
 *   onSessionClosed: (session) => console.log('Session closed:', session),
 * });
 * ```
 */
export function useQueueSSE(options?: {
  onQueueCreated?: (queue: QueueItem) => void;
  onQueueUpdated?: (queue: QueueItem) => void;
  onQueueDeleted?: (data: { id: string }) => void;
  onSessionCreated?: (session: QueueSession) => void;
  onSessionUpdated?: (session: QueueSession) => void;
  onSessionDeleted?: (data: { id: string }) => void;
  onSessionClosed?: (session: QueueSession) => void;
  initialQueues?: QueueItem[];
  initialSessions?: QueueSession[];
}) {
  const {
    onQueueCreated,
    onQueueUpdated,
    onQueueDeleted,
    onSessionCreated,
    onSessionUpdated,
    onSessionDeleted,
    onSessionClosed,
    initialQueues = [],
    initialSessions = [],
  } = options || {};

  const [isConnected, setIsConnected] = useState(false);
  const [queues, setQueues] = useState<QueueItem[]>(initialQueues);
  const [sessions, setSessions] = useState<QueueSession[]>(initialSessions);
  const sseClient = getSSEClient();

  const handleMessage = useCallback(
    (event: SSEEvent) => {
      console.log("[useQueueSSE] Received event:", event.type, event.data);

      switch (event.type) {
        case "connected":
          console.log("[useQueueSSE] SSE connected:", event.data);
          break;

        case "queue_created":
          console.log("[useQueueSSE] Queue created:", event.data);
          setQueues((prev) => [...prev, event.data as QueueItem]);
          onQueueCreated?.(event.data as QueueItem);
          break;

        case "queue_updated":
          console.log("[useQueueSSE] Queue updated:", event.data);
          setQueues((prev) =>
            prev.map((q) => (q.id === (event.data as QueueItem).id ? (event.data as QueueItem) : q))
          );
          onQueueUpdated?.(event.data as QueueItem);
          break;

        case "queue_deleted":
          console.log("[useQueueSSE] Queue deleted:", event.data);
          setQueues((prev) => prev.filter((q) => q.id !== (event.data as { id: string }).id));
          onQueueDeleted?.(event.data as { id: string });
          break;

        case "session_created":
          console.log("[useQueueSSE] Session created:", event.data);
          setSessions((prev) => [...prev, event.data as QueueSession]);
          onSessionCreated?.(event.data as QueueSession);
          break;

        case "session_updated":
          console.log("[useQueueSSE] Session updated:", event.data);
          setSessions((prev) =>
            prev.map((s) =>
              s.id === (event.data as QueueSession).id ? (event.data as QueueSession) : s
            )
          );
          onSessionUpdated?.(event.data as QueueSession);
          break;

        case "session_deleted":
          console.log("[useQueueSSE] Session deleted:", event.data);
          setSessions((prev) => prev.filter((s) => s.id !== (event.data as { id: string }).id));
          onSessionDeleted?.(event.data as { id: string });
          break;

        case "session_closed":
          console.log("[useQueueSSE] Session closed:", event.data);
          setSessions((prev) =>
            prev.map((s) => {
              const closedSession = event.data as QueueSession;
              return s.id === closedSession.id ? { ...s, status: SessionLifecycle.CLOSED } : s;
            })
          );
          onSessionClosed?.(event.data as QueueSession);
          break;

        default:
          console.warn("[useQueueSSE] Unknown event type:", event.type);
      }
    },
    [
      onQueueCreated,
      onQueueUpdated,
      onQueueDeleted,
      onSessionCreated,
      onSessionUpdated,
      onSessionDeleted,
      onSessionClosed,
    ]
  );

  useEffect(() => {
    console.log("[useQueueSSE] Connecting to sessions SSE");

    sseClient.connect("/sessions", {
      onMessage: handleMessage,
      onOpen: () => setIsConnected(true),
      onClose: () => setIsConnected(false),
      onError: (error) => {
        console.error("[useQueueSSE] SSE error:", error);
        setIsConnected(false);
      },
    });

    return () => {
      console.log("[useQueueSSE] Disconnecting from sessions SSE");
      sseClient.disconnect();
    };
  }, [handleMessage, sseClient.connect, sseClient.disconnect]);

  const connect = useCallback(() => {
    console.log("[useQueueSSE] Reconnecting to sessions SSE");
    sseClient.connect("/sessions", {
      onMessage: handleMessage,
      onOpen: () => setIsConnected(true),
      onClose: () => setIsConnected(false),
      onError: (error) => {
        console.error("[useQueueSSE] SSE error:", error);
        setIsConnected(false);
      },
    });
  }, [handleMessage, sseClient]);

  const disconnect = useCallback(() => {
    console.log("[useQueueSSE] Disconnecting from sessions SSE");
    sseClient.disconnect();
    setIsConnected(false);
  }, [sseClient]);

  return {
    isConnected,
    connect,
    disconnect,
    queues,
    sessions,
  };
}
