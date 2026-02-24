import { useCallback, useState } from "react";
import { statusService } from "../services/status.service";
import type { CreateStatusInput, QueueStatus } from "../types";

interface UseStatusesOptions {
  queueId?: string;
}

/**
 * Custom hook for managing statuses with real API integration
 * Handles fetching, creating, updating, and deleting statuses
 */
export function useStatuses(options: UseStatusesOptions = {}) {
  const [statuses, setStatuses] = useState<QueueStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatuses = useCallback(async () => {
    if (!options.queueId) {
      setError("queueId is required to fetch statuses");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data } = await statusService.getStatuses(options.queueId);
      setStatuses(data || []);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Failed to fetch statuses");
    } finally {
      setLoading(false);
    }
  }, [options.queueId]);

  const createStatus = useCallback(async (statusData: CreateStatusInput) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await statusService.createStatus(statusData);
      if (data) {
        setStatuses((prev) => [...prev, data]);
      }
      return data;
    } catch (err: any) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create status";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(
    async (id: string, statusData: Partial<QueueStatus>) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await statusService.updateStatus(id, {
          label: statusData.label,
          color: statusData.color,
          order: statusData.order,
          templateStatusId: statusData.templateStatusId,
        });
        if (data) {
          setStatuses((prev) => prev.map((s) => (s.id === id ? data : s)));
        }
        return data;
      } catch (err: any) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update status";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const deleteStatus = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await statusService.deleteStatus(id);
      setStatuses((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete status";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Manually update status (used by SSE)
  const updateStatusLocal = useCallback((id: string, status: QueueStatus) => {
    setStatuses((prev) => prev.map((s) => (s.id === id ? status : s)));
  }, []);

  // Manually add status (used by SSE)
  const addStatusLocal = useCallback((status: QueueStatus) => {
    setStatuses((prev) => [...prev, status]);
  }, []);

  // Manually remove status (used by SSE)
  const removeStatusLocal = useCallback((id: string) => {
    setStatuses((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return {
    statuses,
    loading,
    error,
    fetchStatuses,
    createStatus,
    updateStatus,
    deleteStatus,
    updateStatusLocal,
    addStatusLocal,
    removeStatusLocal,
  };
}
