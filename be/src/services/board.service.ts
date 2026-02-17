/**
 * Board Service
 * Business logic for board operations
 */

import { getDb } from '../db/index.js';
import { queueBoards } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import type { NewQueueBoard, QueueBoard } from '../db/schema.js';
import type { CreateBoardInput, UpdateBoardInput } from '../validators/board.validator.js';

export class BoardService {
  /**
   * Get all boards
   */
  async getAllBoards(): Promise<QueueBoard[]> {
    const db = getDb();
    return db.select().from(queueBoards).orderBy(queueBoards.createdAt);
  }

  /**
   * Get a single board by ID
   */
  async getBoardById(id: string): Promise<QueueBoard | null> {
    const db = getDb();
    const boards = await db.select().from(queueBoards).where(eq(queueBoards.id, id)).limit(1);
    return boards[0] || null;
  }

  /**
   * Create a new board
   */
  async createBoard(input: CreateBoardInput): Promise<QueueBoard> {
    const db = getDb();
    const newBoard: NewQueueBoard = {
      id: uuidv4(),
      name: input.name,
      description: input.description || null,
      isActive: input.isActive !== undefined ? input.isActive : true,
    };

    const result = await db.insert(queueBoards).values(newBoard).returning();
    return result[0];
  }

  /**
   * Update a board
   */
  async updateBoard(id: string, input: UpdateBoardInput): Promise<QueueBoard | null> {
    const db = getDb();

    // Check if board exists
    const existing = await this.getBoardById(id);
    if (!existing) {
      return null;
    }

    // Build update object with only provided fields
    const updateData: Partial<NewQueueBoard> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;

    const result = await db
      .update(queueBoards)
      .set(updateData)
      .where(eq(queueBoards.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Delete a board
   */
  async deleteBoard(id: string): Promise<boolean> {
    const db = getDb();

    // Check if board exists
    const existing = await this.getBoardById(id);
    if (!existing) {
      return false;
    }

    await db.delete(queueBoards).where(eq(queueBoards.id, id));
    return true;
  }
}

export const boardService = new BoardService();
