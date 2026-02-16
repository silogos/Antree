import { useCallback, useState } from "react";
import { boardService } from "../services/board.service";
import type { CreateBoardInput, QueueBoard } from "../types";

/**
 * Custom hook for managing boards with real API integration
 * Handles fetching, creating, updating, and deleting boards
 */
export function useBoards() {
  const [boards, setBoards] = useState<QueueBoard[]>([]);
  const [currentBoard, setCurrentBoard] = useState<QueueBoard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBoards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await boardService.getBoards();
      setBoards(data || []);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Failed to fetch boards");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBoardById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await boardService.getBoardById(id);
      if (data) {
        setCurrentBoard(data);
      }
      return data;
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Failed to fetch board");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createBoard = useCallback(async (boardData: CreateBoardInput) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await boardService.createBoard(boardData);
      if (data) {
        setBoards((prev) => [...prev, data]);
      }
      return data;
    } catch (err: any) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create board";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBoard = useCallback(
    async (id: string, boardData: Partial<QueueBoard>) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await boardService.updateBoard(id, boardData);
        if (data) {
          setBoards((prev) => prev.map((b) => (b.id === id ? data : b)));
          if (currentBoard?.id === id) {
            setCurrentBoard(data);
          }
        }
        return data;
      } catch (err: any) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update board";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBoard],
  );

  const deleteBoard = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        await boardService.deleteBoard(id);
        setBoards((prev) => prev.filter((b) => b.id !== id));
        if (currentBoard?.id === id) {
          setCurrentBoard(null);
        }
      } catch (err: any) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete board";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentBoard],
  );

  // Manually update board (used by SSE)
  const updateBoardLocal = useCallback(
    (id: string, board: QueueBoard) => {
      setBoards((prev) => prev.map((b) => (b.id === id ? board : b)));
      if (currentBoard?.id === id) {
        setCurrentBoard(board);
      }
    },
    [currentBoard],
  );

  // Manually add board (used by SSE)
  const addBoardLocal = useCallback((board: QueueBoard) => {
    setBoards((prev) => [...prev, board]);
  }, []);

  // Manually remove board (used by SSE)
  const removeBoardLocal = useCallback(
    (id: string) => {
      setBoards((prev) => prev.filter((b) => b.id !== id));
      if (currentBoard?.id === id) {
        setCurrentBoard(null);
      }
    },
    [currentBoard],
  );

  return {
    boards,
    currentBoard,
    loading,
    error,
    fetchBoards,
    fetchBoardById,
    createBoard,
    updateBoard,
    deleteBoard,
    setCurrentBoard,
    updateBoardLocal,
    addBoardLocal,
    removeBoardLocal,
  };
}
