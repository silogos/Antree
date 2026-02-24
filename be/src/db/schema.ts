import { pgTable, serial, text, timestamp, boolean, integer, jsonb, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
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
  id: uuid('id').primaryKey(),
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
  id: uuid('id').primaryKey(),
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
  id: uuid('id').primaryKey(),
  templateId: uuid('template_id').notNull().references(() => queueTemplates.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  color: text('color').notNull(),
  order: integer('order').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type QueueTemplateStatus = typeof queueTemplateStatuses.$inferSelect;
export type NewQueueTemplateStatus = typeof queueTemplateStatuses.$inferInsert;

export const queues = pgTable('queues', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  templateId: uuid('template_id').notNull().references(() => queueTemplates.id, { onDelete: 'cascade' }),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Queue = typeof queues.$inferSelect;
export type NewQueue = typeof queues.$inferInsert;

export const queueSessions = pgTable('queue_sessions', {
  id: uuid('id').primaryKey(),
  templateId: uuid('template_id').notNull().references(() => queueTemplates.id, { onDelete: 'cascade' }),
  queueId: uuid('queue_id').references(() => queues.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  status: text('status').notNull().default('draft'), // draft | active | paused | completed | archived
  sessionNumber: integer('session_number'),
  startedAt: timestamp('started_at'),
  endedAt: timestamp('ended_at'),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type QueueSession = typeof queueSessions.$inferSelect;
export type NewQueueSession = typeof queueSessions.$inferInsert;

export const queueSessionStatuses = pgTable('queue_session_statuses', {
  id: uuid('id').primaryKey(),
  sessionId: uuid('session_id').notNull().references(() => queueSessions.id, { onDelete: 'cascade' }),
  templateStatusId: uuid('template_status_id').references(() => queueTemplateStatuses.id), // Track origin from template
  label: text('label').notNull(),
  color: text('color').notNull(),
  order: integer('status_order').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type QueueSessionStatus = typeof queueSessionStatuses.$inferSelect;
export type NewQueueSessionStatus = typeof queueSessionStatuses.$inferInsert;

export const queueItems = pgTable('queue_items', {
  id: uuid('id').primaryKey(),
  queueId: uuid('queue_id').notNull().references(() => queues.id, { onDelete: 'cascade' }),
  sessionId: uuid('session_id').notNull().references(() => queueSessions.id, { onDelete: 'cascade' }),
  queueNumber: text('queue_number').notNull(),
  name: text('name').notNull(),
  statusId: uuid('status_id').notNull().references(() => queueSessionStatuses.id, { onDelete: 'restrict' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  metadata: jsonb('metadata'),
});

export type QueueItem = typeof queueItems.$inferSelect;
export type NewQueueItem = typeof queueItems.$inferInsert;

export const queueBoardsRelations = relations(queueBoards, ({ many }) => ({
  // Legacy: queue_boards is deprecated, keeping for backward compatibility
  // New flow uses queue_templates → queue_sessions → queue_session_statuses
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
  sessionStatuses: many(queueSessionStatuses),
}));

export const queuesRelations = relations(queues, ({ one, many }) => ({
  template: one(queueTemplates, {
    fields: [queues.templateId],
    references: [queueTemplates.id],
  }),
  sessions: many(queueSessions),
}));

export const queueSessionsRelations = relations(queueSessions, ({ one, many }) => ({
  template: one(queueTemplates, {
    fields: [queueSessions.templateId],
    references: [queueTemplates.id],
  }),
  queue: one(queues, {
    fields: [queueSessions.queueId],
    references: [queues.id],
  }),
  sessionStatuses: many(queueSessionStatuses),
  items: many(queueItems),
}));

export const queueSessionStatusesRelations = relations(queueSessionStatuses, ({ one, many }) => ({
  session: one(queueSessions, {
    fields: [queueSessionStatuses.sessionId],
    references: [queueSessions.id],
  }),
  templateStatus: one(queueTemplateStatuses, {
    fields: [queueSessionStatuses.templateStatusId],
    references: [queueTemplateStatuses.id],
  }),
  queueItems: many(queueItems),
}));

export const queueItemsRelations = relations(queueItems, ({ one }) => ({
  queue: one(queues, {
    fields: [queueItems.queueId],
    references: [queues.id],
  }),
  session: one(queueSessions, {
    fields: [queueItems.sessionId],
    references: [queueSessions.id],
  }),
  status: one(queueSessionStatuses, {
    fields: [queueItems.statusId],
    references: [queueSessionStatuses.id],
  }),
}));
