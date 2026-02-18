/**
 * Validation Schemas for Session
 */

import { z } from 'zod';

export const createSessionSchema = z.object({
  queueId: z.string().uuid(),
  templateId: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  status: z.enum(['draft', 'active', 'closed']).optional(),
});

export const updateSessionSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  status: z.enum(['draft', 'active', 'closed']).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

export const lifecycleUpdateSchema = z.object({
  status: z.enum(['draft', 'active', 'closed']),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
