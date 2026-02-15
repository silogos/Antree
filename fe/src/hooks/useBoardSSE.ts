import { useState, useEffect, useCallback } from 'react';
import { getSSEClient, type SSEEvent } from '../services/sseClient';
import type { QueueItem, QueueStatus } from '../types';

/**
 * Hook for real-time board updates via SSE
 *
 * @param boardId - Board ID to subscribe to
 * @param callbacks - Event handlers for different event types
 *
 * @example
 * ```tsx
 * const { isConnected, connect, disconnect } = useBoardSSE('board-123', {
 *   onQueueCreated: (queue) => console.log('New queue:', queue),
 *   onQueueUpdated: (queue) => console.log('Updated queue:', queue),
 *   onStatusCreated: (status) => console.log('New status:', status),
 * });
 * ```
 */
export function useBoardSSE(
  boardId: string | null,
  callbacks?: {
    onQueueCreated?: (queue: QueueItem) => void;
    onQueueUpdated?: (queue: QueueItem) => void;
    onQueueDeleted?: (data: { id: string }) => void;
    onStatusCreated?: (status: QueueStatus) => void;
    onStatusUpdated?: (status: QueueStatus) => void;
    onStatusDeleted?: (data: { id: string }) => void;
    onBoardUpdated?: (board: any) => void;
    onBoardDeleted?: (data: { id: string }) => void;
  }
) {
  const [isConnected, setIsConnected] = useState(false);
  const sseClient = getSSEClient();

  const handleMessage = useCallback((event: SSEEvent) => {
    console.log('[useBoardSSE] Received event:', event.type, event.data);

    switch (event.type) {
      case 'connected':
        console.log('[useBoardSSE] SSE connected:', event.data);
        break;

      case 'queue_created':
        callbacks?.onQueueCreated?.(event.data as QueueItem);
        break;

      case 'queue_updated':
        callbacks?.onQueueUpdated?.(event.data as QueueItem);
        break;

      case 'queue_deleted':
        callbacks?.onQueueDeleted?.(event.data as { id: string });
        break;

      case 'status_created':
        callbacks?.onStatusCreated?.(event.data as QueueStatus);
        break;

      case 'status_updated':
        callbacks?.onStatusUpdated?.(event.data as QueueStatus);
        break;

      case 'status_deleted':
        callbacks?.onStatusDeleted?.(event.data as { id: string });
        break;

      case 'board_updated':
        callbacks?.onBoardUpdated?.(event.data);
        break;

      case 'board_deleted':
        callbacks?.onBoardDeleted?.(event.data as { id: string });
        break;

      default:
        console.warn('[useBoardSSE] Unknown event type:', event.type);
    }
  }, [callbacks]);

  useEffect(() => {
    if (!boardId) {
      return;
    }

    console.log('[useBoardSSE] Connecting to board:', boardId);

    sseClient.connect(boardId, {
      onMessage: handleMessage,
      onOpen: () => setIsConnected(true),
      onClose: () => setIsConnected(false),
      onError: (error) => {
        console.error('[useBoardSSE] SSE error:', error);
        setIsConnected(false);
      },
    });

    return () => {
      console.log('[useBoardSSE] Disconnecting from board:', boardId);
      sseClient.disconnect();
    };
  }, [boardId, handleMessage]);

  const connect = useCallback(() => {
    if (boardId) {
      sseClient.connect(boardId, {
        onMessage: handleMessage,
        onOpen: () => setIsConnected(true),
        onClose: () => setIsConnected(false),
        onError: (error) => {
          console.error('[useBoardSSE] SSE error:', error);
          setIsConnected(false);
        },
      });
    }
  }, [boardId, handleMessage]);

  const disconnect = useCallback(() => {
    sseClient.disconnect();
    setIsConnected(false);
  }, []);

  return {
    isConnected,
    connect,
    disconnect,
  };
}
