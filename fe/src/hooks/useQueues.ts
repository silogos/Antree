import { useState, useCallback } from 'react';
import { queueService } from '../services/apiQueueService';
import type { QueueItem } from '../types';

interface UseQueuesOptions {
  queueId?: string;
  statusId?: string;
}

/**
 * Custom hook for managing queues with real API integration
 * Handles fetching, creating, updating, and deleting queue items
 */
export function useQueues(options: UseQueuesOptions = {}) {
  const [queues, setQueues] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQueues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await queueService.getQueueItems({
        queueId: options.queueId,
        statusId: options.statusId,
      });
      setQueues(data || []);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Failed to fetch queues');
    } finally {
      setLoading(false);
    }
  }, [options.queueId, options.statusId]);

  const createQueue = useCallback(async (queueData: Omit<QueueItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await queueService.createQueue({
        queueId: queueData.queueId,
        queueNumber: queueData.queueNumber,
        name: queueData.name,
        statusId: queueData.statusId,
        metadata: queueData.metadata,
      });
      if (data) {
        setQueues(prev => [...prev, data]);
      }
      return data;
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create queue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateQueue = useCallback(async (id: string, queueData: Partial<QueueItem>) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await queueService.updateQueue(id, {
        name: queueData.name,
        statusId: queueData.statusId,
        metadata: queueData.metadata,
      });
      if (data) {
        setQueues(prev => prev.map(q => q.id === id ? data : q));
      }
      return data;
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update queue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteQueue = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await queueService.deleteQueue(id);
      setQueues(prev => prev.filter(q => q.id !== id));
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete queue';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Manually update queue (used by SSE)
  const updateQueueLocal = useCallback((id: string, queue: QueueItem) => {
    setQueues(prev => prev.map(q => q.id === id ? queue : q));
  }, []);

  // Manually add queue (used by SSE)
  const addQueueLocal = useCallback((queue: QueueItem) => {
    setQueues(prev => [...prev, queue]);
  }, []);

  // Manually remove queue (used by SSE)
  const removeQueueLocal = useCallback((id: string) => {
    setQueues(prev => prev.filter(q => q.id !== id));
  }, []);

  return {
    queues,
    loading,
    error,
    fetchQueues,
    createQueue,
    updateQueue,
    deleteQueue,
    updateQueueLocal,
    addQueueLocal,
    removeQueueLocal,
  };
}
