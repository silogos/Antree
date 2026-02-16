import type { CreateTemplateInput, QueueTemplate } from "../types";
import type { ApiResponse } from "./board.service";
import http from "./http";

/**
 * API Service - Templates
 */
export const templateService = {
  /**
   * Get all templates
   */
  async getTemplates(): Promise<ApiResponse<QueueTemplate[]>> {
    return http.get<ApiResponse<QueueTemplate[]>>("/templates", {
      withAuth: false,
    });
  },

  /**
   * Get a single template by ID
   */
  async getTemplateById(id: string): Promise<ApiResponse<QueueTemplate>> {
    return http.get<ApiResponse<QueueTemplate>>(`/templates/${id}`, {
      withAuth: false,
    });
  },

  /**
   * Create a new template
   */
  async createTemplate(
    data: CreateTemplateInput,
  ): Promise<ApiResponse<QueueTemplate>> {
    return http.post<ApiResponse<QueueTemplate>>("/templates", data, {
      withAuth: false,
    });
  },

  /**
   * Update an existing template
   */
  async updateTemplate(
    id: string,
    data: Partial<CreateTemplateInput>,
  ): Promise<ApiResponse<QueueTemplate>> {
    return http.put<ApiResponse<QueueTemplate>>(`/templates/${id}`, data, {
      withAuth: false,
    });
  },

  /**
   * Delete a template
   */
  async deleteTemplate(id: string): Promise<ApiResponse<{ id: string }>> {
    return http.delete<ApiResponse<{ id: string }>>(`/templates/${id}`, {
      withAuth: false,
    });
  },
};
