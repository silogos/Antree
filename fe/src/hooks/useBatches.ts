import { useCallback, useState } from "react";
import { batchService } from "../services/batch.service";
import type { QueueBatch } from "../types";

/**
 * Custom hook for managing batches with real API integration
 * Handles fetching, creating, updating, and deleting batches
 */
export function useBatches() {
  const [batches, setBatches] = useState<QueueBatch[]>([]);
  const [currentBatch, setCurrentBatch] = useState<QueueBatch | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await batchService.getBatches();
      setBatches(data || []);
      // Set first batch as current if none selected
      if (!currentBatch && data && data.length > 0) {
        setCurrentBatch(data[0]);
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Failed to fetch batches");
    } finally {
      setLoading(false);
    }
  }, [currentBatch]);

  const createBatch = useCallback(
    async (batchData: {
      queueId: string;
      name?: string;
      status?: "active" | "closed";
    }) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await batchService.createBatch(batchData);
        if (data) {
          setBatches((prev) => [...prev, data]);
          setCurrentBatch(data);
        }
        return data;
      } catch (err: any) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create batch";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const updateBatch = useCallback(
    async (id: string, batchData: Partial<QueueBatch>) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await batchService.updateBatch(id, batchData);
        if (data) {
          setBatches((prev) => prev.map((b) => (b.id === id ? data : b)));
          if (currentBatch?.id === id) {
            setCurrentBatch(data);
          }
        }
        return data;
      } catch (err: any) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update batch";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBatch],
  );

  const deleteBatch = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        await batchService.deleteBatch(id);
        setBatches((prev) => prev.filter((b) => b.id !== id));
        if (currentBatch?.id === id) {
          setCurrentBatch(null);
        }
      } catch (err: any) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete batch";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBatch],
  );

  return {
    batches,
    currentBatch,
    loading,
    error,
    fetchBatches,
    createBatch,
    updateBatch,
    deleteBatch,
    setCurrentBatch,
  };
}
