import { pgTable, serial, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  fullName: text('full_name'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const queueBoards = pgTable('queue_boards', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type QueueBoard = typeof queueBoards.$inferSelect;
export type NewQueueBoard = typeof queueBoards.$inferInsert;

// ============================================================================
// NEW: Template-based queue system
// ============================================================================

export const queueTemplates = pgTable('queue_templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  isSystemTemplate: boolean('is_system_template').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type QueueTemplate = typeof queueTemplates.$inferSelect;
export type NewQueueTemplate = typeof queueTemplates.$inferInsert;

export const queueTemplateStatuses = pgTable('queue_template_statuses', {
  id: text('id').primaryKey(),
  templateId: text('template_id').notNull().references(() => queueTemplates.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  color: text('color').notNull(),
  order: integer('order').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type QueueTemplateStatus = typeof queueTemplateStatuses.$inferSelect;
export type NewQueueTemplateStatus = typeof queueTemplateStatuses.$inferInsert;

export const queues = pgTable('queues', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  templateId: text('template_id').notNull().references(() => queueTemplates.id, { onDelete: 'cascade' }),
  createdBy: text('created_by').references(() => users.id, { onDelete: 'set null' }),
  updatedBy: text('updated_by').references(() => users.id, { onDelete: 'set null' }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Queue = typeof queues.$inferSelect;
export type NewQueue = typeof queues.$inferInsert;

export const queueBatches = pgTable('queue_batches', {
  id: text('id').primaryKey(),
  queueId: text('queue_id').notNull().references(() => queues.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  status: text('status').notNull().default('active'), // active, closed
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type QueueBatch = typeof queueBatches.$inferSelect;
export type NewQueueBatch = typeof queueBatches.$inferInsert;

export const queueStatuses = pgTable('queue_statuses', {
  id: text('id').primaryKey(),
  queueId: text('queue_id').notNull().references(() => queueBatches.id, { onDelete: 'cascade' }),
  templateStatusId: text('template_status_id').references(() => queueTemplateStatuses.id), // Track origin from template
  label: text('label').notNull(),
  color: text('color').notNull(),
  order: integer('order').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type QueueStatus = typeof queueStatuses.$inferSelect;
export type NewQueueStatus = typeof queueStatuses.$inferInsert;

export const queueItems = pgTable('queue_items', {
  id: text('id').primaryKey(),
  queueId: text('queue_id').notNull().references(() => queueBatches.id, { onDelete: 'cascade' }),
  queueNumber: text('queue_number').notNull(),
  name: text('name').notNull(),
  statusId: text('status_id').notNull().references(() => queueStatuses.id, { onDelete: 'restrict' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  metadata: jsonb('metadata'),
});

export type QueueItem = typeof queueItems.$inferSelect;
export type NewQueueItem = typeof queueItems.$inferInsert;

export const queueBoardsRelations = relations(queueBoards, ({ many }) => ({
  // Legacy: queue_boards is deprecated, keeping for backward compatibility
  // New flow uses queue_templates → queue_batches → queue_statuses
}));

export const queueTemplatesRelations = relations(queueTemplates, ({ many }) => ({
  templateStatuses: many(queueTemplateStatuses),
  queues: many(queues),
}));

export const queueTemplateStatusesRelations = relations(queueTemplateStatuses, ({ one, many }) => ({
  template: one(queueTemplates, {
    fields: [queueTemplateStatuses.templateId],
    references: [queueTemplates.id],
  }),
  statuses: many(queueStatuses),
}));

export const queuesRelations = relations(queues, ({ one, many }) => ({
  template: one(queueTemplates, {
    fields: [queues.templateId],
    references: [queueTemplates.id],
  }),
  batches: many(queueBatches),
}));

export const queueBatchesRelations = relations(queueBatches, ({ one, many }) => ({
  queue: one(queues, {
    fields: [queueBatches.queueId],
    references: [queues.id],
  }),
  statuses: many(queueStatuses),
  items: many(queueItems),
}));

export const queueStatusesRelations = relations(queueStatuses, ({ one, many }) => ({
  batch: one(queueBatches, {
    fields: [queueStatuses.queueId],
    references: [queueBatches.id],
  }),
  templateStatus: one(queueTemplateStatuses, {
    fields: [queueStatuses.templateStatusId],
    references: [queueTemplateStatuses.id],
  }),
  queueItems: many(queueItems),
}));

export const queueItemsRelations = relations(queueItems, ({ one }) => ({
  batch: one(queueBatches, {
    fields: [queueItems.queueId],
    references: [queueBatches.id],
  }),
  status: one(queueStatuses, {
    fields: [queueItems.statusId],
    references: [queueStatuses.id],
  }),
}));
