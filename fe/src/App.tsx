import { useEffect, useState } from 'react';
import { useQueues } from './hooks/useQueues';
import { useStatuses } from './hooks/useStatuses';
import { useBoards } from './hooks/useBoards';
import { useBoardSSE } from './hooks/useBoardSSE';
import { useAutoRefresh } from './hooks/useAutoRefresh';
import { useSound } from './hooks/useSound';
import { useAutoMovement } from './hooks/useAutoMovement';
import { QueueItem, QueueStatus } from './types';

// Components
import { DashboardBoard } from './components/KanbanBoard';
import { Topbar } from './components/Topbar';
import { Footer } from './components/Footer';
import { AddQueueModal } from './components/AddQueueModal';
import { StatusManagerModal } from './components/StatusManagerModal';

/**
 * Main App Component
 * Integrates backend API, SSE, and all hooks
 */
function App() {
  // Board management
  const {
    boards,
    currentBoard,
    loading: boardsLoading,
    fetchBoards,
    setCurrentBoard,
  } = useBoards();

  // Queue management
  const [queues, setQueues] = useState<QueueItem[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const {
    queues: queuesData,
    loading: queuesLoading,
    error: queuesError,
    fetchQueues: fetchQueuesData,
    addQueueLocal,
    updateQueueLocal,
    removeQueueLocal,
  } = useQueues({ boardId: currentBoard?.id });

  // Status management
  const [statuses, setStatuses] = useState<QueueStatus[]>([]);

  const {
    statuses: statusesData,
    loading: statusesLoading,
    error: statusesError,
    fetchStatuses: fetchStatusesData,
    addStatusLocal,
    updateStatusLocal,
    removeStatusLocal,
  } = useStatuses({ boardId: currentBoard?.id });

  // Sound hooks (initialize before SSE)
  const { soundEnabled, toggleSound, playAnnouncement } = useSound();

  // Helper to check if queue move should trigger announcement
  const shouldAnnounce = (newQueue: QueueItem, oldStatusId?: string) => {
    if (!soundEnabled) return false;

    // Only announce if status actually changed
    if (oldStatusId && oldStatusId === newQueue.statusId) {
      return false;
    }

    // Find the "In Progress" or similar "called" status (second in order)
    const sortedStatuses = [...statuses].sort((a, b) => a.order - b.order);
    const calledStatus = sortedStatuses[1]; // Second status (e.g., "In Progress")

    // Play announcement if queue moved to "called" status
    if (calledStatus && newQueue.statusId === calledStatus.id) {
      return true;
    }

    return false;
  };

  // SSE integration for real-time updates
  const { isConnected: sseConnected } = useBoardSSE(currentBoard?.id || null, {
    onQueueCreated: (queue) => {
      addQueueLocal(queue);
      setLastRefresh(new Date());
    },
    onQueueUpdated: (queue) => {
      // Find previous status to detect if queue was called
      const oldQueue = queues.find(q => q.id === queue.id);
      const oldStatusId = oldQueue?.statusId;

      updateQueueLocal(queue.id, queue);
      setLastRefresh(new Date());

      // Check if we should play announcement
      if (shouldAnnounce(queue, oldStatusId)) {
        const customerName = queue.metadata?.customerName || queue.name;
        playAnnouncement(queue.queueNumber, customerName);
      }
    },
    onQueueDeleted: ({ id }) => {
      removeQueueLocal(id);
      setLastRefresh(new Date());
    },
    onStatusCreated: (status) => {
      addStatusLocal(status);
    },
    onStatusUpdated: (status) => {
      updateStatusLocal(status.id, status);
    },
    onStatusDeleted: ({ id }) => {
      removeStatusLocal(id);
    },
    onBoardDeleted: ({ id }) => {
      if (currentBoard?.id === id) {
        setCurrentBoard(null);
        setQueues([]);
        setStatuses([]);
      }
    },
  });

  // Other hooks
  const { lastRefresh: _refreshTime } = useAutoRefresh();

  // Auto-movement integration
  const { autoMovementEnabled, toggleAutoMovement } = useAutoMovement({
    queues,
    statuses,
    onQueuesUpdate: setQueues,
    playAnnouncement,
  });

  // Initialize boards
  useEffect(() => {
    fetchBoards();
  }, []);

  // Set first board as current if none selected
  useEffect(() => {
    if (boards.length > 0 && !currentBoard) {
      setCurrentBoard(boards[0]);
    }
  }, [boards, currentBoard, setCurrentBoard]);

  // Initialize data when board changes
  useEffect(() => {
    if (currentBoard) {
      fetchQueuesData();
      fetchStatusesData();
    }
  }, [currentBoard, fetchQueuesData, fetchStatusesData]);

  // Update local state when hook data changes
  useEffect(() => {
    if (!queuesLoading && queuesData) {
      setQueues(queuesData);
      setLastRefresh(new Date());
    }
  }, [queuesLoading, queuesData]);

  useEffect(() => {
    if (!statusesLoading && statusesData) {
      setStatuses(statusesData);
    }
  }, [statusesLoading, statusesData]);

  // Handle queue operations
  const handleAddQueueSuccess = () => {
    setLastRefresh(new Date());
  };

  const handleStatusManagerSuccess = () => {
    fetchStatusesData();
  };

  // Loading state
  const isLoading = boardsLoading || queuesLoading || statusesLoading;

  // Error state
  const hasError = boardsLoading ? false : queuesError || statusesError;

  const handleSoundChange = () => {
    toggleSound();
  };

  const handleAutoMovementChange = () => {
    toggleAutoMovement();
  };

  // No boards state
  const noBoards = !boardsLoading && boards.length === 0;

  // No board selected state
  const noBoardSelected = !boardsLoading && boards.length > 0 && !currentBoard;

  return (
    <div className="App">
      {/* Topbar - always visible */}
      <Topbar
        title="Antree App"
        lastRefresh={lastRefresh}
        soundEnabled={soundEnabled}
        onToggleSound={handleSoundChange}
        autoMovementEnabled={autoMovementEnabled}
        onToggleAutoMovement={handleAutoMovementChange}
        boardSelector={
          <select
            value={currentBoard?.id || ''}
            onChange={(e) => {
              const board = boards.find(b => b.id === e.target.value);
              if (board) {
                setCurrentBoard(board);
              }
            }}
            className="bg-gray-700 text-white text-sm rounded-md px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={boardsLoading || boards.length === 0}
          >
            {boards.length === 0 && (
              <option value="">No boards</option>
            )}
            {boards.map((board) => (
              <option key={board.id} value={board.id}>
                {board.name}
              </option>
            ))}
          </select>
        }
        sseConnected={sseConnected}
      />

      {/* Main Content */}
      <div className="flex-1 bg-gray-800">

        {/* Loading state */}
        {isLoading && (
          <div className="loading-container">
            <p>Loading data...</p>
          </div>
        )}

        {/* No boards state */}
        {!isLoading && noBoards && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8 bg-gray-700 rounded-lg">
              <h2 className="text-2xl font-bold mb-4 text-white">No Boards Found</h2>
              <p className="text-gray-300 mb-4">Please create a board to get started.</p>
              <p className="text-sm text-gray-400">Hint: Use the backend seed script to create initial boards.</p>
            </div>
          </div>
        )}

        {/* No board selected state */}
        {!isLoading && noBoardSelected && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8 bg-gray-700 rounded-lg">
              <h2 className="text-2xl font-bold mb-4 text-white">No Board Selected</h2>
              <p className="text-gray-300">Please select a board from the dropdown above.</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {!isLoading && !noBoards && !noBoardSelected && hasError && (
          <div className="error-container">
            <p>Error loading data. Please refresh page.</p>
            {queuesError && <p className="text-sm mt-2">{queuesError}</p>}
            {statusesError && <p className="text-sm mt-2">{statusesError}</p>}
          </div>
        )}

        {/* Dashboard board - main content (always show when board selected, even with no queues) */}
        {!isLoading && !noBoards && !noBoardSelected && !hasError && (
          <DashboardBoard
            queues={queues}
            statuses={statuses}
          />
        )}
      </div>

      {/* Footer - hidden on TV screens */}
      {!isLoading && !noBoards && !noBoardSelected && !hasError && (
        <Footer />
      )}

      {/* Modals */}
      <>
        <AddQueueModal
          open={false}
          onClose={() => {}}
          onSuccess={handleAddQueueSuccess}
          statuses={statuses}
          boardId={currentBoard?.id || ''}
        />
        <StatusManagerModal
          open={false}
          onClose={() => {}}
          onSuccess={handleStatusManagerSuccess}
          boardId={currentBoard?.id || ''}
        />
      </>
    </div>
  );
}

export default App;
