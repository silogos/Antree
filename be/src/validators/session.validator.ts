/**
 * Validation Schemas for Session
 */

import { z } from 'zod';

export const createSessionSchema = z.object({
  queue_id: z.string().uuid(),
  template_id: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  status: z.enum(['active', 'paused', 'completed', 'archived']).optional(),
});

export const updateSessionSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  status: z.enum(['active', 'paused', 'completed', 'archived']).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

export const lifecycleUpdateSchema = z.object({
  status: z.enum(['active', 'paused', 'completed', 'archived']),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
