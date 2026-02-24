/**
 * Queue Service
 * Business logic for queue operations (template-based queues)
 */

import { and, desc, eq, sql } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { db } from "../../db/index.js";
import type { NewQueue, Queue, QueueItem, QueueSession } from "../../db/schema.js";
import {
	queueItems,
	queueSessionStatuses,
	queueSessions,
	queues,
	queueTemplateStatuses,
	queueTemplates,
} from "../../db/schema.js";
import { sseBroadcaster } from "../../sse/broadcaster.js";
import type {
	CreateQueueInput,
	ResetQueueInput,
	UpdateQueueInput,
} from "./queue.validator.js";
import type { PaginatedResponse, PaginationParams } from "../../lib/pagination.js";
import { calculatePaginationMetadata, getPaginationOffset } from "../../lib/pagination.js";

export class QueueService {
	/**
	 * Get all queues with pagination
	 */
	async getAllQueues(pagination?: PaginationParams): Promise<PaginatedResponse<Queue>> {
		const page = pagination?.page || 1;
		const limit = pagination?.limit || 20;
		const offset = getPaginationOffset(page, limit);

		// Get total count
		const [{ count }] = await db
			.select({ count: sql<number>`count(*)::int` })
			.from(queues);

		// Get paginated data
		const data = await db
			.select()
			.from(queues)
			.orderBy(desc(queues.createdAt))
			.limit(limit)
			.offset(offset);

		return {
			data,
			meta: calculatePaginationMetadata(count, page, limit),
		};
	}

	/**
	 * Get all queues (non-paginated, for backward compatibility)
	 */
	async getAllQueuesList(): Promise<Queue[]> {
		return db.select().from(queues).orderBy(desc(queues.createdAt));
	}

	/**
	 * Get a single queue by ID
	 */
	async getQueueById(id: string): Promise<Queue | null> {
		const queue = await db
			.select()
			.from(queues)
			.where(eq(queues.id, id))
			.limit(1);

		if (!queue || queue.length === 0) {
			return null;
		}

		return queue[0] || null;
	}

	/**
	 * Get queue items for a queue (from active session) with pagination
	 */
	async getQueueItems(
		sessionId: string,
		pagination?: PaginationParams
	): Promise<PaginatedResponse<QueueItem>> {
		const page = pagination?.page || 1;
		const limit = pagination?.limit || 50; // Higher default for items
		const offset = getPaginationOffset(page, limit);

		const conditions: ReturnType<typeof eq>[] = [
			eq(queueItems.sessionId, sessionId),
		];

		// Get total count
		const [{ count }] = await db
			.select({ count: sql<number>`count(*)::int` })
			.from(queueItems)
			.where(conditions.length === 1 ? conditions[0] : and(...conditions));

		// Get paginated data
		const data = await db
			.select()
			.from(queueItems)
			.where(conditions.length === 1 ? conditions[0] : and(...conditions))
			.orderBy(queueItems.createdAt)
			.limit(limit)
			.offset(offset);

		return {
			data,
			meta: calculatePaginationMetadata(count, page, limit),
		};
	}

	/**
	 * Get active session for a queue with its statuses
	 */
	async getActiveSession(queueId: string): Promise<{
		session: QueueSession;
		statuses: (typeof queueSessionStatuses.$inferSelect)[];
	} | null> {
		// Verify queue exists
		const queue = await db
			.select()
			.from(queues)
			.where(eq(queues.id, queueId))
			.limit(1);
		if (!queue || queue.length === 0) {
			return null;
		}

		// Get active session
		const activeSession = await db
			.select()
			.from(queueSessions)
			.where(
				and(
					eq(queueSessions.queueId, queueId),
					eq(queueSessions.status, "active"),
				),
			)
			.limit(1);

		if (!activeSession || activeSession.length === 0) {
			return null;
		}

		// Get statuses for the session
		const statuses = await db
			.select()
			.from(queueSessionStatuses)
			.where(eq(queueSessionStatuses.sessionId, activeSession[0].id))
			.orderBy(queueSessionStatuses.order);

		return {
			session: activeSession[0],
			statuses,
		};
	}

	/**
	 * Create a new queue
	 */
	async createQueue(input: CreateQueueInput): Promise<Queue | null> {
		// Verify template exists
		const template = await db
			.select()
			.from(queueTemplates)
			.where(eq(queueTemplates.id, input.templateId))
			.limit(1);
		if (!template || template.length === 0) {
			return null;
		}

		const newQueue: NewQueue = {
			id: uuidv7(),
			name: input.name,
			templateId: input.templateId,
			createdBy: input.createdBy || null,
			updatedBy: input.updatedBy || null,
			isActive: input.isActive !== undefined ? input.isActive : true,
		};

		const result = await db.insert(queues).values(newQueue).returning();

		// Broadcast queue_created event
		if (result[0]) {
			this.broadcastQueueCreated(result[0]);
		}

		return result[0] || null;
	}

	/**
	 * Update a queue
	 */
	async updateQueue(
		id: string,
		input: UpdateQueueInput,
	): Promise<Queue | null> {
		// Check if queue exists
		const existing = await db
			.select()
			.from(queues)
			.where(eq(queues.id, id))
			.limit(1);
		if (!existing || existing.length === 0) {
			return null;
		}

		// Build update object with only provided fields
		const updateData: Partial<NewQueue> = {};
		if (input.name !== undefined) updateData.name = input.name;
		if (input.isActive !== undefined) updateData.isActive = input.isActive;
		if (input.updatedBy !== undefined) updateData.updatedBy = input.updatedBy;

		const result = await db
			.update(queues)
			.set(updateData)
			.where(eq(queues.id, id))
			.returning();

		// Broadcast queue_updated event
		if (result[0]) {
			this.broadcastQueueUpdated(result[0]);
		}

		return result[0] || null;
	}

	/**
	 * Delete a queue (cascades to sessions, statuses, items)
	 */
	async deleteQueue(id: string): Promise<boolean> {
		// Check if queue exists
		const existing = await db
			.select()
			.from(queues)
			.where(eq(queues.id, id))
			.limit(1);
		if (!existing || existing.length === 0) {
			return false;
		}

		const queue = existing[0];

		await db.delete(queues).where(eq(queues.id, id));

		// Broadcast queue_deleted event
		this.broadcastQueueDeleted(queue);

		return true;
	}

	/**
	 * Reset queue by closing current active session and creating a new one
	 */
	async resetQueue(
		id: string,
		input: ResetQueueInput = {},
	): Promise<QueueSession | null> {
		// Verify queue exists
		const queue = await db
			.select()
			.from(queues)
			.where(eq(queues.id, id))
			.limit(1);
		if (!queue || queue.length === 0) {
			return null;
		}

		// Get template for the queue
		const template = await db
			.select()
			.from(queueTemplates)
			.where(eq(queueTemplates.id, queue[0].templateId))
			.limit(1);

		// Close current active session if exists
		const currentActiveSession = await db
			.select()
			.from(queueSessions)
			.where(
				and(eq(queueSessions.queueId, id), eq(queueSessions.status, "active")),
			)
			.limit(1);

		if (currentActiveSession && currentActiveSession.length > 0) {
			await db
				.update(queueSessions)
				.set({ status: "closed" })
				.where(eq(queueSessions.id, currentActiveSession[0].id));
		}

		// Create new session
		const newSession = {
			id: uuidv7(),
			templateId: queue[0].templateId,
			queueId: id,
			name: input.name || `Session - ${new Date().toISOString()}`,
			status: "active" as const,
		};

		const sessionResult = await db
			.insert(queueSessions)
			.values(newSession)
			.returning();
		const sessionId = sessionResult[0].id;

		// Copy statuses from template
		if (template && template.length > 0) {
			const templateStatuses = await db
				.select()
				.from(queueTemplateStatuses)
				.where(eq(queueTemplateStatuses.templateId, queue[0].templateId))
				.orderBy(queueTemplateStatuses.order);

			const sessionStatuses = templateStatuses.map((ts) => ({
				id: uuidv7(),
				sessionId: sessionId,
				templateStatusId: ts.id,
				label: ts.label,
				color: ts.color,
				order: ts.order,
			}));

			if (sessionStatuses.length > 0) {
				await db.insert(queueSessionStatuses).values(sessionStatuses);
			}
		}

		return sessionResult[0];
	}

	/**
	 * Broadcast queue_created event
	 */
	broadcastQueueCreated(queue: Queue): void {
		sseBroadcaster.broadcast({
			type: "queue_created",
			data: {
				id: queue.id,
				name: queue.name,
				template_id: queue.templateId,
				is_active: queue.isActive,
				created_by: queue.createdBy ?? undefined,
				updated_by: queue.updatedBy ?? undefined,
				created_at: queue.createdAt.toISOString(),
				updated_at: queue.updatedAt?.toISOString(),
			},
			queueId: queue.id,
		});
	}

	/**
	 * Broadcast queue_updated event
	 */
	broadcastQueueUpdated(queue: Queue): void {
		sseBroadcaster.broadcast({
			type: "queue_updated",
			data: {
				id: queue.id,
				name: queue.name,
				template_id: queue.templateId,
				is_active: queue.isActive,
				created_by: queue.createdBy ?? undefined,
				updated_by: queue.updatedBy ?? undefined,
				created_at: queue.createdAt.toISOString(),
				updated_at: queue.updatedAt?.toISOString(),
			},
			queueId: queue.id,
		});
	}

	/**
	 * Broadcast queue_deleted event
	 */
	broadcastQueueDeleted(queue: Queue): void {
		sseBroadcaster.broadcast({
			type: "queue_deleted",
			data: {
				id: queue.id,
			},
			queueId: queue.id,
		});
	}
}

export const queueService = new QueueService();
