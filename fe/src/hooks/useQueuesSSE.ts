import { useCallback, useEffect, useState } from "react";
import { getSSEClient, type SSEEvent } from "../services/sseClient";
import { SessionLifecycle } from "../types/queue";
import type { Queue, QueueSession } from "../types";

/**
 * Hook for real-time queue list updates via SSE
 *
 * Connects to /queues endpoint and handles:
 * - Queue events: queue_created, queue_updated, queue_deleted
 * - Session lifecycle: session_created, session_updated, session_deleted, session_closed
 *
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * const { isConnected, queues, connect, disconnect } = useQueuesSSE({
 *   onQueueCreated: (queue) => console.log('New queue:', queue),
 *   onSessionCreated: (session) => console.log('New session:', session),
 *   onSessionClosed: (session) => console.log('Session closed:', session),
 * });
 * ```
 */
export function useQueuesSSE(options?: {
  onQueueCreated?: (queue: Queue) => void;
  onQueueUpdated?: (queue: Queue) => void;
  onQueueDeleted?: (data: { id: string }) => void;
  onSessionCreated?: (session: QueueSession) => void;
  onSessionUpdated?: (session: QueueSession) => void;
  onSessionDeleted?: (data: { id: string }) => void;
  onSessionClosed?: (session: QueueSession) => void;
  initialQueues?: Queue[];
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
  const [queues, setQueues] = useState<Queue[]>(initialQueues);
  const [sessions, setSessions] = useState<QueueSession[]>(initialSessions);
  const sseClient = getSSEClient();

  const handleMessage = useCallback(
    (event: SSEEvent) => {
      console.log("[useQueuesSSE] Received event:", event.type, event.data);

      switch (event.type) {
        case "connected":
          console.log("[useQueuesSSE] SSE connected:", event.data);
          break;

        case "queue_created":
          console.log("[useQueuesSSE] Queue created:", event.data);
          setQueues((prev) => [...prev, event.data as Queue]);
          onQueueCreated?.(event.data as Queue);
          break;

        case "queue_updated":
          console.log("[useQueuesSSE] Queue updated:", event.data);
          setQueues((prev) =>
            prev.map((q) => (q.id === (event.data as Queue).id ? (event.data as Queue) : q)),
          );
          onQueueUpdated?.(event.data as Queue);
          break;

        case "queue_deleted":
          console.log("[useQueuesSSE] Queue deleted:", event.data);
          setQueues((prev) => prev.filter((q) => q.id !== (event.data as { id: string }).id));
          onQueueDeleted?.(event.data as { id: string });
          break;

        case "session_created":
          console.log("[useQueuesSSE] Session created:", event.data);
          setSessions((prev) => [...prev, event.data as QueueSession]);
          onSessionCreated?.(event.data as QueueSession);
          break;

        case "session_updated":
          console.log("[useQueuesSSE] Session updated:", event.data);
          setSessions((prev) =>
            prev.map((s) => (s.id === (event.data as QueueSession).id ? (event.data as QueueSession) : s)),
          );
          onSessionUpdated?.(event.data as QueueSession);
          break;

        case "session_deleted":
          console.log("[useQueuesSSE] Session deleted:", event.data);
          setSessions((prev) => prev.filter((s) => s.id !== (event.data as { id: string }).id));
          onSessionDeleted?.(event.data as { id: string });
          break;

        case "session_closed":
          console.log("[useQueuesSSE] Session closed:", event.data);
          setSessions((prev) =>
            prev.map((s) => {
              const closedSession = event.data as QueueSession;
              return s.id === closedSession.id
                ? { ...s, status: SessionLifecycle.CLOSED }
                : s;
            }),
          );
          onSessionClosed?.(event.data as QueueSession);
          break;

        default:
          console.warn("[useQueuesSSE] Unknown event type:", event.type);
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
    ],
  );

  useEffect(() => {
    console.log("[useQueuesSSE] Connecting to queues SSE");

    sseClient.connect("/queues", {
      onMessage: handleMessage,
      onOpen: () => setIsConnected(true),
      onClose: () => setIsConnected(false),
      onError: (error) => {
        console.error("[useQueuesSSE] SSE error:", error);
        setIsConnected(false);
      },
    });

    return () => {
      console.log("[useQueuesSSE] Disconnecting from queues SSE");
      sseClient.disconnect();
    };
  }, [handleMessage, sseClient]);

  const connect = useCallback(() => {
    console.log("[useQueuesSSE] Reconnecting to queues SSE");
    sseClient.connect("/queues", {
      onMessage: handleMessage,
      onOpen: () => setIsConnected(true),
      onClose: () => setIsConnected(false),
      onError: (error) => {
        console.error("[useQueuesSSE] SSE error:", error);
        setIsConnected(false);
      },
    });
  }, [handleMessage, sseClient]);

  const disconnect = useCallback(() => {
    console.log("[useQueuesSSE] Disconnecting from queues SSE");
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
