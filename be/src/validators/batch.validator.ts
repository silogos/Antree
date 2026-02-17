/**
 * Validation Schemas for Batch
 */

import { z } from 'zod';

export const createBatchSchema = z.object({
  queueId: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  status: z.enum(['active', 'closed']).optional(),
});

export const updateBatchSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  status: z.enum(['active', 'closed']).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

export type CreateBatchInput = z.infer<typeof createBatchSchema>;
export type UpdateBatchInput = z.infer<typeof updateBatchSchema>;
