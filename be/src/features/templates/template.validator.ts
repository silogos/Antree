/**
 * Validation Schemas for Template
 */

import { z } from "zod";

export const createTemplateSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updateTemplateSchema = z
  .object({
    name: z.string().min(3).max(100).optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const createTemplateStatusSchema = z.object({
  label: z.string().min(1).max(50),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{3,6}$/, "Color must be a valid hex color (e.g., #FF0000 or #F00)"),
  order: z.number().int().min(0),
});

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
export type CreateTemplateStatusInput = z.infer<typeof createTemplateStatusSchema>;
