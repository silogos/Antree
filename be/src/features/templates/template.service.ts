/**
 * Template Service
 * Business logic for template operations
 */

import { db } from '../../db/index.js';
import { queueTemplates, queueTemplateStatuses } from '../../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { v7 as uuidv7 } from 'uuid';
import type { NewQueueTemplate, NewQueueTemplateStatus } from '../../db/schema.js';
import type { CreateTemplateInput, UpdateTemplateInput, CreateTemplateStatusInput } from './template.validator.js';

export class TemplateService {
  /**
   * Get all templates
   */
  async getAllTemplates(): Promise<typeof queueTemplates.$inferSelect[]> {
    return db.select().from(queueTemplates).orderBy(desc(queueTemplates.createdAt));
  }

  /**
   * Get a single template by ID
   */
  async getTemplateById(id: string): Promise<typeof queueTemplates.$inferSelect | null> {
    const templates = await db.select().from(queueTemplates).where(eq(queueTemplates.id, id)).limit(1);
    return templates[0] || null;
  }

  /**
   * Create a new template
   */
  async createTemplate(input: CreateTemplateInput): Promise<typeof queueTemplates.$inferSelect> {
    const newTemplate: NewQueueTemplate = {
      id: uuidv7(),
      name: input.name,
      description: input.description || null,
      isActive: input.isActive !== undefined ? input.isActive : true,
    };

    const result = await db.insert(queueTemplates).values(newTemplate).returning();
    return result[0];
  }

  /**
   * Update a template
   */
  async updateTemplate(id: string, input: UpdateTemplateInput): Promise<typeof queueTemplates.$inferSelect | null> {

    // Check if template exists
    const existing = await this.getTemplateById(id);
    if (!existing) {
      return null;
    }

    // Build update object with only provided fields
    const updateData: Partial<NewQueueTemplate> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;

    const result = await db
      .update(queueTemplates)
      .set(updateData)
      .where(eq(queueTemplates.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Delete a template
   */
  async deleteTemplate(id: string): Promise<boolean> {
    // Check if template exists
    const existing = await this.getTemplateById(id);
    if (!existing) {
      return false;
    }

    await db.delete(queueTemplates).where(eq(queueTemplates.id, id));
    return true;
  }

  /**
   * Get statuses for a template
   */
  async getTemplateStatuses(templateId: string): Promise<typeof queueTemplateStatuses.$inferSelect[] | null> {
    // Verify template exists
    const template = await this.getTemplateById(templateId);
    if (!template) {
      return null;
    }

    return db
      .select()
      .from(queueTemplateStatuses)
      .where(eq(queueTemplateStatuses.templateId, templateId))
      .orderBy(queueTemplateStatuses.order);
  }

  /**
   * Add status to a template
   */
  async addTemplateStatus(templateId: string, input: CreateTemplateStatusInput): Promise<typeof queueTemplateStatuses.$inferSelect | null> {
    // Verify template exists
    const template = await this.getTemplateById(templateId);
    if (!template) {
      return null;
    }

    const newStatus: NewQueueTemplateStatus = {
      id: uuidv7(),
      templateId,
      label: input.label,
      color: input.color,
      order: input.order,
    };

    const result = await db.insert(queueTemplateStatuses).values(newStatus).returning();
    return result[0];
  }
}

export const templateService = new TemplateService();
