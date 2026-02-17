/**
 * Validation Schemas for Board
 */

import { z } from 'zod';

export const createBoardSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updateBoardSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
