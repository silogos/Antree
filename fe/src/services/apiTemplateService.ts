import { apiRequest, ApiResponse } from './apiBoardService';
import type { QueueTemplate, CreateTemplateInput, UpdateTemplateInput } from '../types';

/**
 * API Service - Templates
 */
export const templateService = {
  /**
   * Get all templates
   */
  async getTemplates(): Promise<ApiResponse<QueueTemplate[]>> {
    return apiRequest<QueueTemplate[]>('/templates');
  },

  /**
   * Get a single template by ID
   */
  async getTemplateById(id: string): Promise<ApiResponse<QueueTemplate>> {
    return apiRequest<QueueTemplate>(`/templates/${id}`);
  },

  /**
   * Create a new template
   */
  async createTemplate(data: CreateTemplateInput): Promise<ApiResponse<QueueTemplate>> {
    return apiRequest<QueueTemplate>('/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing template
   */
  async updateTemplate(id: string, data: Partial<CreateTemplateInput>): Promise<ApiResponse<QueueTemplate>> {
    return apiRequest<QueueTemplate>(`/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a template
   */
  async deleteTemplate(id: string): Promise<ApiResponse<{ id: string }>> {
    return apiRequest<{ id: string }>(`/templates/${id}`, {
      method: 'DELETE',
    });
  },
};
