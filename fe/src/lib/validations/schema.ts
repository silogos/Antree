import { z } from "zod"

// ============================================================================
// Queue Item Schema
// ============================================================================

export const queueItemSchema = z.object({
  id: z.string(),
  queueNumber: z.string(),
  name: z.string(),
  service: z.string().optional(),
  statusId: z.string(),
  customerName: z.string().optional(),
  duration: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type QueueItem = z.infer<typeof queueItemSchema>

// ============================================================================
// Status Schema
// ============================================================================

export const statusSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  description: z.string().optional(),
  order: z.number().int().positive().default(0),
})

export type QueueStatus = z.infer<typeof statusSchema>

// ============================================================================
// Queue Creation Schema (for new queues)
// ============================================================================

export const createQueueSchema = z.object({
  queueNumber: z.string().min(1, "Number is required"),
  name: z.string().min(1, "Customer name is required"),
  service: z.string().min(1, "Service is required"),
  customerName: z.string().min(1, "Customer name is required"),
  duration: z.string().min(1, "Duration is required"),
  statusId: z.string().min(1, "Status is required"),
})

export type CreateQueueInput = z.infer<typeof createQueueSchema>

// ============================================================================
// Status Creation Schema (for new statuses)
// ============================================================================

export const createStatusSchema = z.object({
  name: z.string(),
  color: z.string(),
  description: z.string().optional(),
  order: z.number().int().positive().default(0),
})

export type CreateStatusInput = z.infer<typeof createStatusSchema>

// ============================================================================
// Queue Update Schema (for updating existing queues)
// ============================================================================

export const updateQueueSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  service: z.string().optional(),
  customerName: z.string().optional(),
  duration: z.string().optional(),
})

export type UpdateQueueInput = z.infer<typeof updateQueueSchema>

// ============================================================================
// Status Update Schema (for updating existing statuses)
// ============================================================================

export const updateStatusSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  color: z.string().optional(),
  description: z.string().optional(),
  order: z.number().int().positive().optional(),
})

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>
