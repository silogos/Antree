import type { QueueSession, QueueSessionStatus, SessionLifecycleDTO } from "../types";
import type { ApiResponse } from "../types/http.types";
import http from "./http.service";

/**
 * Session Service (New Implementation)
 * API client for session operations - Created fresh to follow backend rules
 */
export const sessionService = {
  /**
   * Get all sessions with optional filters
   * GET /sessions?queueId={queueId}&status={status}
   */
  async getSessions(params?: {
    queueId?: string;
    status?: "active" | "paused" | "completed" | "archived";
  }): Promise<ApiResponse<QueueSession[]>> {
    return http.get<ApiResponse<QueueSession[]>>("/sessions", {
      params: params as Record<string, string>,
      withAuth: false,
    });
  },

  /**
   * Get a single session by ID
   * GET /sessions/:id
   */
  async getSessionById(id: string): Promise<ApiResponse<QueueSession>> {
    return http.get<ApiResponse<QueueSession>>(`/sessions/${id}`, {
      withAuth: false,
    });
  },

  /**
   * Get session statuses
   * GET /sessions/:sessionId/statuses
   */
  async getSessionStatuses(sessionId: string): Promise<ApiResponse<QueueSessionStatus[]>> {
    return http.get<ApiResponse<QueueSessionStatus[]>>(
      `/sessions/${sessionId}/statuses`,
      {
        withAuth: false,
      },
    );
  },

  /**
   * Create a new session via queue endpoint
   * POST /queues/:queueId/sessions
   * Backend expects: { name?: string, status?: 'active'|'paused'|'completed'|'archived' }
   */
  async createSessionViaQueue(
    queueId: string,
    data: {
      name?: string;
      status?: "active" | "paused" | "completed" | "archived";
    },
  ): Promise<ApiResponse<QueueSession>> {
    return http.post<ApiResponse<QueueSession>>(
      `/queues/${queueId}/sessions`,
      data,
      {
        withAuth: false,
      },
    );
  },

  /**
   * Create a new session (legacy endpoint)
   * POST /sessions
   * Backend expects: { queueId, templateId, name?, status? }
   */
  async createSession(data: {
    queueId: string;
    templateId: string;
    name?: string;
    status?: "active" | "paused" | "completed" | "archived";
  }): Promise<ApiResponse<QueueSession>> {
    return http.post<ApiResponse<QueueSession>>("/sessions", data, {
      withAuth: false,
    });
  },

  /**
   * Update a session
   * PATCH /sessions/:id
   * Backend expects: { name?: string }
   */
  async updateSession(
    id: string,
    data: { name?: string },
  ): Promise<ApiResponse<QueueSession>> {
    return http.patch<ApiResponse<QueueSession>>(`/sessions/${id}`, data, {
      withAuth: false,
    });
  },

  /**
   * Update session lifecycle status
   * PATCH /sessions/:id/lifecycle
   * Backend expects: { status: 'active'|'paused'|'completed'|'archived' }
   */
  async updateSessionLifecycle(
    id: string,
    status: SessionLifecycleDTO,
  ): Promise<ApiResponse<QueueSession>> {
    return http.patch<ApiResponse<QueueSession>>(
      `/sessions/${id}/lifecycle`,
      { status: status.status },
      {
        withAuth: false,
      },
    );
  },

  /**
   * Delete a session
   * DELETE /sessions/:id
   */
  async deleteSession(id: string): Promise<ApiResponse<{ id: string }>> {
    return http.delete<ApiResponse<{ id: string }>>(`/sessions/${id}`, {
      withAuth: false,
    });
  },

  /**
   * Connect to session SSE stream
   * GET /sessions/:sessionId/stream
   * Returns SSE connection URL
   */
  getSessionStreamUrl(sessionId: string): string {
    return `/sessions/${sessionId}/stream`;
  },
};
