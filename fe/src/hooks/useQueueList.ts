import { useCallback, useState } from "react";
import { queueService } from "../services/queue-list.service";
import type { Queue } from "../types";

interface UseQueueListOptions {
  templateId?: string;
  isActive?: boolean;
}

/**
 * Custom hook for managing queue list (parent queues, not queue items)
 * Handles fetching queues, getting active batch, reset queue
 */
export function useQueueList(options: UseQueueListOptions = {}) {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [currentQueue, setCurrentQueue] = useState<Queue | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQueues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await queueService.getQueues({
        templateId: options.templateId,
        isActive: options.isActive,
      });
      setQueues(data || []);
      // Set first queue as current if none selected (using functional update to avoid dependency)
      setCurrentQueue((prev) => {
        if (!prev && data && data.length > 0) {
          return data[0];
        }
        return prev;
      });
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Failed to fetch queues");
    } finally {
      setLoading(false);
    }
  }, [options.templateId, options.isActive]);

  const fetchQueueById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await queueService.getQueueById(id);
      if (data) {
        setCurrentQueue(data);
        return data;
      }
      return null;
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Failed to fetch queue");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getActiveBatch = useCallback(async (queueId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await queueService.getActiveBatch(queueId);
      return data;
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Failed to get active batch");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createQueue = useCallback(
    async (queueData: {
      name: string;
      templateId: string;
      createdBy?: string;
      updatedBy?: string;
      isActive?: boolean;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await queueService.createQueue(queueData);
        if (data) {
          setQueues((prev) => [...prev, data]);
          setCurrentQueue(data);
        }
        return data;
      } catch (err: any) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create queue";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const updateQueue = useCallback(
    async (
      id: string,
      queueData: { name?: string; isActive?: boolean; updatedBy?: string },
    ) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await queueService.updateQueue(id, queueData);
        if (data) {
          setQueues((prev) => prev.map((q) => (q.id === id ? data : q)));
          if (currentQueue?.id === id) {
            setCurrentQueue(data);
          }
        }
        return data;
      } catch (err: any) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update queue";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentQueue],
  );

  const deleteQueue = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        await queueService.deleteQueue(id);
        setQueues((prev) => prev.filter((q) => q.id !== id));
        if (currentQueue?.id === id) {
          setCurrentQueue(null);
        }
      } catch (err: any) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete queue";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentQueue],
  );

  const resetQueue = useCallback(
    async (queueId: string, data?: { name?: string }) => {
      setLoading(true);
      setError(null);
      try {
        const { data: result } = await queueService.resetQueue(queueId, data);
        return result;
      } catch (err: any) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to reset queue";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    queues,
    currentQueue,
    loading,
    error,
    fetchQueues,
    fetchQueueById,
    getActiveBatch,
    createQueue,
    updateQueue,
    deleteQueue,
    resetQueue,
    setCurrentQueue,
  };
}
