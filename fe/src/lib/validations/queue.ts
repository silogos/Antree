import { z } from "zod"
import { queueItemSchema, createQueueSchema, updateQueueSchema } from "./schema"

// ============================================================================
// Queue Item Validation
// ============================================================================

/**
 * Validates queue item data structure
 * Used for displaying queue items in the UI
 */
export const queueItemValidation = {
  schema: queueItemSchema,
  validate: (data: unknown) => queueItemSchema.safeParse(data),
}

// ============================================================================
// Queue Creation Validation
// ============================================================================

/**
 * Validates queue creation form data
 * Required fields: name
 * Optional fields: service, customerName, duration
 */
export const queueCreateValidation = {
  schema: createQueueSchema,
  validate: (data: unknown) => createQueueSchema.safeParse(data),
  requiredFields: ["name"],
}

// ============================================================================
// Queue Update Validation
// ============================================================================

/**
 * Validates queue update form data
 * Required field: id
 * Optional fields: name, service, customerName, duration
 */
export const queueUpdateValidation = {
  schema: updateQueueSchema,
  validate: (data: unknown) => updateQueueSchema.safeParse(data),
  requiredField: "id",
}

// ============================================================================
// Queue Number Validation
// ============================================================================

/**
 * Validates queue number format
 * Should be a string that can be parsed as a number
 */
export const queueNumberValidation = z
  .string()
  .min(1, "Number is required")
  .regex(/^[0-9]+$/, "Number must contain only digits")

export type QueueNumber = z.infer<typeof queueNumberValidation>

// ============================================================================
// Queue Duration Validation
// ============================================================================

/**
 * Validates queue duration format
 * Should be a string in HH:MM:SS or MM:SS format
 */
export const queueDurationValidation = z
  .string()
  .optional()
  .refine(
    (value) => {
      if (!value) return true
      // Match HH:MM:SS or MM:SS format
      return /^([0-9]{1,2}:){1,2}[0-9]{2}$/.test(value)
    },
    {
      message: "Duration must be in HH:MM:SS or MM:SS format",
    }
  )

export type QueueDuration = z.infer<typeof queueDurationValidation>
