import { useCallback, useState } from "react";
import { sessionService } from "../services/session.service";
import type { QueueSession, SessionLifecycleDTO } from "../types";

/**
 * Custom hook for managing sessions with real API integration
 * Handles fetching, creating, updating, and deleting sessions
 * Based on OpenAPI spec - sessions are created under queues
 */
export function useSessions() {
  const [sessions, setSessions] = useState<QueueSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async (params?: { queueId?: string; status?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await sessionService.getSessions(params);
      if (response.success && response.data) {
        setSessions(response.data);
      } else {
        setError(response.error || "Failed to fetch sessions");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  const createSession = useCallback(async (data: { queueId: string; name?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await sessionService.createSession(data);
      if (response.success && response.data) {
        const sessionData = response.data;
        setSessions((prev) => [...prev, sessionData]);
        return sessionData;
      } else {
        setError(response.error || "Failed to create session");
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSession = useCallback(async (id: string, data: { name?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await sessionService.updateSession(id, data);
      if (response.success && response.data) {
        const sessionData = response.data;
        setSessions((prev) => prev.map((session) => (session.id === id ? sessionData : session)));
        return sessionData;
      } else {
        setError(response.error || "Failed to update session");
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSessionLifecycle = useCallback(async (id: string, status: SessionLifecycleDTO) => {
    setLoading(true);
    setError(null);
    try {
      const response = await sessionService.updateSessionLifecycle(id, status);
      if (response.success && response.data) {
        setSessions((prev) => prev.map((session) => (session.id === id ? response.data : session)));
        return response.data;
      } else {
        setError(response.error || "Failed to update session lifecycle");
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSession = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await sessionService.deleteSession(id);
      if (response.success && response.data) {
        setSessions((prev) => prev.filter((session) => session.id !== id));
        return response.data;
      } else {
        setError(response.error || "Failed to delete session");
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    createSession,
    updateSession,
    updateSessionLifecycle,
    deleteSession,
  };
}
