import { useCallback, useEffect, useState } from "react";
import { getSSEClient, type SSEEvent } from "../services/sse.service";
import type { QueueStatus } from "../types";

/**
 * Hook for real-time status updates via SSE
 *
 * Connects to status endpoint and handles:
 * - Status events: status_created, status_updated, status_deleted
 * - Session status events: session_status_created, session_status_updated, session_status_deleted
 *
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * const { isConnected, connect, disconnect } = useStatusesSSE({
 *   onStatusCreated: (status) => console.log('New status:', status),
 *   onSessionStatusCreated: (status) => console.log('New session status:', status),
 * });
 * ```
 */
export function useStatusesSSE(options?: {
  onStatusCreated?: (status: QueueStatus) => void;
  onStatusUpdated?: (status: QueueStatus) => void;
  onStatusDeleted?: (data: { id: string }) => void;
  onSessionStatusCreated?: (status: QueueStatus) => void;
  onSessionStatusUpdated?: (status: QueueStatus) => void;
  onSessionStatusDeleted?: (data: { id: string }) => void;
  initialStatuses?: QueueStatus[];
  sessionId?: string;
}) {
  const {
    onStatusCreated,
    onStatusUpdated,
    onStatusDeleted,
    onSessionStatusCreated,
    onSessionStatusUpdated,
    onSessionStatusDeleted,
    initialStatuses = [],
    sessionId,
  } = options || {};

  const [isConnected, setIsConnected] = useState(false);
  const [statuses, setStatuses] = useState<QueueStatus[]>(initialStatuses);
  const sseClient = getSSEClient();

  const handleMessage = useCallback(
    (event: SSEEvent) => {
      console.log("[useStatusesSSE] Received event:", event.type, event.data);

      switch (event.type) {
        case "connected":
          console.log("[useStatusesSSE] SSE connected:", event.data);
          break;

        case "status_created":
          console.log("[useStatusesSSE] Status created:", event.data);
          setStatuses((prev) => [...prev, event.data as QueueStatus]);
          onStatusCreated?.(event.data as QueueStatus);
          break;

        case "status_updated":
          console.log("[useStatusesSSE] Status updated:", event.data);
          setStatuses((prev) =>
            prev.map((s) => (s.id === (event.data as QueueStatus).id ? (event.data as QueueStatus) : s)),
          );
          onStatusUpdated?.(event.data as QueueStatus);
          break;

        case "status_deleted":
          console.log("[useStatusesSSE] Status deleted:", event.data);
          setStatuses((prev) => prev.filter((s) => s.id !== (event.data as { id: string }).id));
          onStatusDeleted?.(event.data as { id: string });
          break;

        case "session_status_created":
          console.log("[useStatusesSSE] Session status created:", event.data);
          setStatuses((prev) => [...prev, event.data as QueueStatus]);
          onSessionStatusCreated?.(event.data as QueueStatus);
          break;

        case "session_status_updated":
          console.log("[useStatusesSSE] Session status updated:", event.data);
          setStatuses((prev) =>
            prev.map((s) => (s.id === (event.data as QueueStatus).id ? (event.data as QueueStatus) : s)),
          );
          onSessionStatusUpdated?.(event.data as QueueStatus);
          break;

        case "session_status_deleted":
          console.log("[useStatusesSSE] Session status deleted:", event.data);
          setStatuses((prev) => prev.filter((s) => s.id !== (event.data as { id: string }).id));
          onSessionStatusDeleted?.(event.data as { id: string });
          break;

        default:
          console.warn("[useStatusesSSE] Unknown event type:", event.type);
      }
    },
    [
      onStatusCreated,
      onStatusUpdated,
      onStatusDeleted,
      onSessionStatusCreated,
      onSessionStatusUpdated,
      onSessionStatusDeleted,
    ],
  );

  useEffect(() => {
    const endpoint = sessionId ? `/sessions/${sessionId}/statuses` : "/statuses";
    console.log("[useStatusesSSE] Connecting to status SSE:", endpoint);

    sseClient.connect(endpoint, {
      onMessage: handleMessage,
      onOpen: () => setIsConnected(true),
      onClose: () => setIsConnected(false),
      onError: (error) => {
        console.error("[useStatusesSSE] SSE error:", error);
        setIsConnected(false);
      },
    });

    return () => {
      console.log("[useStatusesSSE] Disconnecting from status SSE");
      sseClient.disconnect();
    };
  }, [handleMessage, sessionId]);

  const connect = useCallback(() => {
    const endpoint = sessionId ? `/sessions/${sessionId}/statuses` : "/statuses";
    console.log("[useStatusesSSE] Reconnecting to status SSE:", endpoint);
    sseClient.connect(endpoint, {
      onMessage: handleMessage,
      onOpen: () => setIsConnected(true),
      onClose: () => setIsConnected(false),
      onError: (error) => {
        console.error("[useStatusesSSE] SSE error:", error);
        setIsConnected(false);
      },
    });
  }, [handleMessage, sessionId, sseClient]);

  const disconnect = useCallback(() => {
    console.log("[useStatusesSSE] Disconnecting from status SSE");
    sseClient.disconnect();
    setIsConnected(false);
  }, [sseClient]);

  return {
    isConnected,
    connect,
    disconnect,
    statuses,
  };
}
