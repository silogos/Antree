import { useState, useEffect, useCallback } from 'react';
import { getSSEClient, type SSEEvent } from '../services/sseClient';
import type { QueueItem, QueueStatus } from '../types';

/**
 * Hook for real-time batch updates via SSE
 *
 * @param batchId - Batch ID to subscribe to
 * @param callbacks - Event handlers for different event types
 *
 * @example
 * ```tsx
 * const { isConnected, connect, disconnect } = useBatchSSE('batch-123', {
 *   onQueueCreated: (queue) => console.log('New queue:', queue),
 *   onQueueUpdated: (queue) => console.log('Updated queue:', queue),
 *   onStatusCreated: (status) => console.log('New status:', status),
 * });
 * ```
 */
export function useBatchSSE(
  batchId: string | null,
  callbacks?: {
    onQueueCreated?: (queue: any) => void;
    onQueueUpdated?: (queue: any) => void;
    onQueueDeleted?: (data: { id: string }) => void;
    onQueueItemCreated?: (queue: QueueItem) => void;
    onQueueItemUpdated?: (queue: QueueItem) => void;
    onQueueItemDeleted?: (data: { id: string }) => void;
    onStatusCreated?: (status: QueueStatus) => void;
    onStatusUpdated?: (status: QueueStatus) => void;
    onStatusDeleted?: (data: { id: string }) => void;
    onBatchUpdated?: (batch: any) => void;
    onBatchDeleted?: (data: { id: string }) => void;
  }
) {
  const [isConnected, setIsConnected] = useState(false);
  const sseClient = getSSEClient();

  const handleMessage = useCallback((event: SSEEvent) => {
    console.log('[useBatchSSE] Received event:', event.type, event.data);

    switch (event.type) {
      case 'connected':
        console.log('[useBatchSSE] SSE connected:', event.data);
        break;

      case 'queue_created':
        callbacks?.onQueueCreated?.(event.data as any);
        break;

      case 'queue_updated':
        callbacks?.onQueueUpdated?.(event.data as any);
        break;

      case 'queue_deleted':
        callbacks?.onQueueDeleted?.(event.data as { id: string });
        break;

      case 'queue_item_created':
        callbacks?.onQueueItemCreated?.(event.data as QueueItem);
        break;

      case 'queue_item_updated':
        callbacks?.onQueueItemUpdated?.(event.data as QueueItem);
        break;

      case 'queue_item_deleted':
        callbacks?.onQueueItemDeleted?.(event.data as { id: string });
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

      case 'batch_updated':
        callbacks?.onBatchUpdated?.(event.data);
        break;

      case 'batch_deleted':
        callbacks?.onBatchDeleted?.(event.data as { id: string });
        break;

      default:
        console.warn('[useBatchSSE] Unknown event type:', event.type);
    }
  }, [callbacks]);

  useEffect(() => {
    if (!batchId) {
      return;
    }

    console.log('[useBatchSSE] Connecting to batch:', batchId);

    sseClient.connect(batchId, {
      onMessage: handleMessage,
      onOpen: () => setIsConnected(true),
      onClose: () => setIsConnected(false),
      onError: (error) => {
        console.error('[useBatchSSE] SSE error:', error);
        setIsConnected(false);
      },
    });

    return () => {
      console.log('[useBatchSSE] Disconnecting from batch:', batchId);
      sseClient.disconnect();
    };
  }, [batchId, handleMessage]);

  const connect = useCallback(() => {
    if (batchId) {
      sseClient.connect(batchId, {
        onMessage: handleMessage,
        onOpen: () => setIsConnected(true),
        onClose: () => setIsConnected(false),
        onError: (error) => {
          console.error('[useBatchSSE] SSE error:', error);
          setIsConnected(false);
        },
      });
    }
  }, [batchId, handleMessage]);

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
