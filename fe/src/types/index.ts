/**
 * Type definitions for the Antree Queue App
 * Central export point for all TypeScript interfaces
 */

// Re-export commonly used types for convenience
export type {
  CreateBatchInput,
  CreateBoardInput,
  CreateQueueInput,
  CreateQueueItemInput,
  CreateStatusInput,
  Queue,
  QueueBatch,
  QueueBoard,
  QueueItem,
  QueueStatus,
  QueueTemplate,
  SSEEvent,
  SSEEventType,
  UpdateBatchInput,
  UpdateBoardInput,
  UpdateQueueInput,
  UpdateQueueItemInput,
  UpdateStatusInput,
} from "./queue";
export * from "./queue";
