import { useCallback, useEffect, useRef, useState } from "react";
import type { QueueStatus } from "../lib/validations/schema";
import { getSSEClient, type SSEEvent } from "../services/sse.service";
import type { QueueItem, QueueSession } from "../types";

export function useSessionSSE(
  sessionId: string | null,
  callbacks?: {
    onQueueCreated?: (queue: any) => void;
    onQueueUpdated?: (queue: any) => void;
    onQueueDeleted?: (data: { id: string }) => void;
    onQueueItemCreated?: (queue: QueueItem) => void;
    onQueueItemUpdated?: (queue: QueueItem) => void;
    onQueueItemStatusChanged?: (queue: QueueItem) => void;
    onQueueItemDeleted?: (data: { id: string }) => void;
    onStatusCreated?: (status: QueueStatus) => void;
    onStatusUpdated?: (status: QueueStatus) => void;
    onStatusDeleted?: (data: { id: string }) => void;
    onSessionCreated?: (session: QueueSession) => void;
    onSessionUpdated?: (session: QueueSession) => void;
    onSessionDeleted?: (data: { id: string }) => void;
    onSessionPaused?: (session: QueueSession) => void;
    onSessionResumed?: (session: QueueSession) => void;
    onSessionCompleted?: (session: QueueSession) => void;
    onSessionArchived?: (session: QueueSession) => void;
    onSessionClosed?: (session: QueueSession) => void;
  },
) {
  const [isConnected, setIsConnected] = useState(false);

  // Create the client inside a ref or use the singleton.
  // Note: if multiple components use this simultaneously,
  // you should NOT use a singleton.
  const sseClient = getSSEClient();

  // 1. Store callbacks in a ref to prevent infinite re-renders
  const callbacksRef = useRef(callbacks);
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  const handleMessage = useCallback((event: SSEEvent) => {
    console.log("[useSessionSSE] Received event:", event.type, event.data);

    // Use the ref to access the latest callbacks
    const currentCallbacks = callbacksRef.current;

    switch (event.type) {
      case "connected":
        console.log("[useSessionSSE] SSE connected:", event.data);
        break;
      case "queue_created":
        currentCallbacks?.onQueueCreated?.(event.data as any);
        break;
      case "queue_updated":
        currentCallbacks?.onQueueUpdated?.(event.data as any);
        break;
      case "queue_deleted":
        currentCallbacks?.onQueueDeleted?.(event.data as { id: string });
        break;
      case "queue_item_created":
        currentCallbacks?.onQueueItemCreated?.(event.data as QueueItem);
        break;
      case "queue_item_updated":
        currentCallbacks?.onQueueItemUpdated?.(event.data as QueueItem);
        break;
      case "queue_item_status_changed":
        currentCallbacks?.onQueueItemStatusChanged?.(event.data as QueueItem);
        break;
      case "queue_item_deleted":
        currentCallbacks?.onQueueItemDeleted?.(event.data as { id: string });
        break;
      case "status_created":
        currentCallbacks?.onStatusCreated?.(event.data as QueueStatus);
        break;
      case "status_updated":
        currentCallbacks?.onStatusUpdated?.(event.data as QueueStatus);
        break;
      case "status_deleted":
        currentCallbacks?.onStatusDeleted?.(event.data as { id: string });
        break;
      case "session_created":
        currentCallbacks?.onSessionCreated?.(event.data as QueueSession);
        break;
      case "session_updated":
        currentCallbacks?.onSessionUpdated?.(event.data as QueueSession);
        break;
      case "session_deleted":
        currentCallbacks?.onSessionDeleted?.(event.data as { id: string });
        break;
      case "session_paused":
        currentCallbacks?.onSessionPaused?.(event.data as QueueSession);
        break;
      case "session_resumed":
        currentCallbacks?.onSessionResumed?.(event.data as QueueSession);
        break;
      case "session_completed":
        currentCallbacks?.onSessionCompleted?.(event.data as QueueSession);
        break;
      case "session_archived":
        currentCallbacks?.onSessionArchived?.(event.data as QueueSession);
        break;
      case "session_closed":
        currentCallbacks?.onSessionClosed?.(event.data as QueueSession);
        break;
      default:
        console.warn("[useSessionSSE] Unknown event type:", event.type);
    }
  }, []); // Empty dependency array ensures this function is only created once

  const disconnect = useCallback(() => {
    if (!sessionId) return;
    console.log("[useSessionSSE] Disconnecting from session:", sessionId);
    sseClient.disconnect();
    setIsConnected(false);
  }, [sessionId, sseClient]);

  useEffect(() => {
    if (!sessionId) return;

    console.log("[useSessionSSE] Connecting to session:", sessionId);

    sseClient.connectSession(sessionId, {
      onMessage: handleMessage,
      onOpen: () => setIsConnected(true),
      onClose: () => setIsConnected(false),
      onError: (error) => {
        console.error("[useSessionSSE] SSE error:", error);
        setIsConnected(false);
      },
    });

    // 2. Add cleanup function to prevent memory leaks and zombie connections
    return () => {
      disconnect();
    };
  }, [sessionId, handleMessage, sseClient, disconnect]);

  return {
    isConnected,
    disconnect,
  };
}
