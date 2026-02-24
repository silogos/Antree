/**
 * Validation Schemas for Status
 */

import { z } from 'zod';

export const createStatusSchema = z.object({
  sessionId: z.string().uuid(),
  label: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{3,6}$/, 'Color must be a valid hex color (e.g., #FF0000 or #F00)'),
  order: z.number().int().min(0),
  templateStatusId: z.string().uuid().optional().nullable(),
});

export const updateStatusSchema = z.object({
  label: z.string().min(1).max(50).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{3,6}$/, 'Color must be a valid hex color (e.g., #FF0000 or #F00)').optional(),
  order: z.number().int().min(0).optional(),
  templateStatusId: z.string().uuid().optional().nullable(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

export type CreateStatusInput = z.infer<typeof createStatusSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
