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

export const queueStatuses = pgTable('queue_statuses', {
  id: text('id').primaryKey(),
  boardId: text('board_id').notNull().references(() => queueBoards.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),
  color: text('color').notNull(),
  order: integer('order').notNull(),
});

export type QueueStatus = typeof queueStatuses.$inferSelect;
export type NewQueueStatus = typeof queueStatuses.$inferInsert;

export const queueItems = pgTable('queue_items', {
  id: text('id').primaryKey(),
  boardId: text('board_id').notNull().references(() => queueBoards.id, { onDelete: 'cascade' }),
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
  statuses: many(queueStatuses),
  queueItems: many(queueItems),
}));

export const queueStatusesRelations = relations(queueStatuses, ({ one, many }) => ({
  board: one(queueBoards, {
    fields: [queueStatuses.boardId],
    references: [queueBoards.id],
  }),
  queueItems: many(queueItems),
}));

export const queueItemsRelations = relations(queueItems, ({ one }) => ({
  board: one(queueBoards, {
    fields: [queueItems.boardId],
    references: [queueBoards.id],
  }),
  status: one(queueStatuses, {
    fields: [queueItems.statusId],
    references: [queueStatuses.id],
  }),
}));
