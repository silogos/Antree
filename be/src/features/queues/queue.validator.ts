/**
 * Validation Schemas for Queue (template-based queues)
 */

import { z } from 'zod';

export const createQueueSchema = z.object({
  name: z.string().min(1).max(255),
  templateId: z.string().uuid(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updateQueueSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  isActive: z.boolean().optional(),
  updatedBy: z.string().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

export const resetQueueSchema = z.object({
  name: z.string().optional(),
});

export type CreateQueueInput = z.infer<typeof createQueueSchema>;
export type UpdateQueueInput = z.infer<typeof updateQueueSchema>;
export type ResetQueueInput = z.infer<typeof resetQueueSchema>;
