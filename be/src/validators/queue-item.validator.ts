/**
 * Validation Schemas for Queue Item (individual queue entries)
 */

import { z } from 'zod';

export const createQueueItemSchema = z.object({
  queue_id: z.string().min(1),
  session_id: z.string().min(1),
  queueNumber: z.string().min(1),
  name: z.string().min(1).max(255),
  status_id: z.string().uuid(),
  metadata: z.record(z.string(), z.unknown()).optional().nullable(),
});

export const updateQueueItemSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  status_id: z.string().uuid().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

export type CreateQueueItemInput = z.infer<typeof createQueueItemSchema>;
export type UpdateQueueItemInput = z.infer<typeof updateQueueItemSchema>;
