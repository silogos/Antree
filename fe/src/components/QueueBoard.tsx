import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAutoMovement } from "../hooks/useAutoMovement";
import { useAutoRefresh } from "../hooks/useAutoRefresh";
import { useBatchSSE } from "../hooks/useBatchSSE";
import { useQueueList } from "../hooks/useQueueList";
import { useQueues } from "../hooks/useQueues";
import { useSound } from "../hooks/useSound";
import { useStatuses } from "../hooks/useStatuses";
import type { QueueItem, QueueStatus } from "../types";
import { AddQueueModal } from "./AddQueueModal";
import { Footer } from "./Footer";
// Components
import { DashboardBoard } from "./KanbanBoard";
import { StatusManagerModal } from "./StatusManagerModal";
import { Topbar } from "./Topbar";

/**
 * QueueBoard Component
 * Displays a single queue with its active batch and queue items
 * This is the main queue management UI for a specific queue
 */
export function QueueBoard() {
  const { id: queueId } = useParams<{ id: string }>();

  // Get queue information with active batch
  const {
    currentQueue,
    loading: queueLoading,
    fetchQueueById,
  } = useQueueList();

  // Queue management (items)
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
  } = useQueues({ queueId: currentQueue?.id || undefined });

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
  } = useStatuses({
    queueId: currentQueue?.activeBatchId || undefined,
  });

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
  const { isConnected: sseConnected } = useBatchSSE(
    currentQueue?.activeBatchId || null,
    {
      onQueueItemCreated: (queue) => {
        addQueueLocal(queue);
        setLastRefresh(new Date());
      },
      onQueueItemUpdated: (queue) => {
        // Find previous status to detect if queue was called
        const oldQueue = queues.find((q) => q.id === queue.id);
        const oldStatusId = oldQueue?.statusId;

        updateQueueLocal(queue.id, queue);
        setLastRefresh(new Date());

        // Check if we should play announcement
        if (shouldAnnounce(queue, oldStatusId)) {
          const customerName = queue.metadata?.customerName || queue.name;
          playAnnouncement(queue.queueNumber, customerName);
        }
      },
      onQueueItemDeleted: ({ id }) => {
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
      onBatchDeleted: ({ id }) => {
        if (currentQueue?.activeBatchId === id) {
          // Navigate back to board list if current batch is deleted
          window.location.href = "/";
        }
      },
    },
  );

  // Other hooks
  const { lastRefresh: _refreshTime } = useAutoRefresh();

  // Auto-movement integration
  const { autoMovementEnabled, toggleAutoMovement } = useAutoMovement({
    queues,
    statuses,
    onQueuesUpdate: setQueues,
    playAnnouncement,
  });

  // Initialize: fetch queue with active batch - run only when queueId changes
  useEffect(() => {
    if (queueId) {
      fetchQueueById(queueId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queueId]);

  // Initialize data when activeBatchId is available - run only when activeBatchId changes
  useEffect(() => {
    if (currentQueue?.activeBatchId) {
      fetchQueuesData();
      fetchStatusesData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQueue?.activeBatchId]);

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

  const handleSoundChange = () => {
    toggleSound();
  };

  const handleAutoMovementChange = () => {
    toggleAutoMovement();
  };

  // Loading state
  const isLoading = queueLoading || queuesLoading || statusesLoading;

  // Error state
  const hasError = !queueLoading && (queuesError || statusesError);

  // Invalid queueId
  if (!queueId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-gray-700 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-white">Invalid Queue</h2>
          <p className="text-gray-300 mb-4">No queue ID provided.</p>
          <Link
            to="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Board List
          </Link>
        </div>
      </div>
    );
  }

  // No active batch found
  if (!queueLoading && currentQueue && !currentQueue.activeBatchId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-gray-700 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-white">
            No Active Batch
          </h2>
          <p className="text-gray-300 mb-4">
            This queue doesn't have an active batch.
          </p>
          <p className="text-sm text-gray-400 mb-4">
            Create or reset a batch to start managing queues.
          </p>
          <Link
            to="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Board List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="App flex flex-col h-screen">
      {/* Topbar */}
      <Topbar
        title={
          currentQueue?.activeBatch?.name || currentQueue?.name || "Queue Board"
        }
        lastRefresh={lastRefresh}
        soundEnabled={soundEnabled}
        onToggleSound={handleSoundChange}
        autoMovementEnabled={autoMovementEnabled}
        onToggleAutoMovement={handleAutoMovementChange}
        sseConnected={sseConnected}
      />

      {/* Main Content */}
      <div className="flex-1 bg-gray-800 min-h-0">
        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading data...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {!isLoading && hasError && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8 bg-gray-700 rounded-lg">
              <h2 className="text-2xl font-bold mb-4 text-white">Error</h2>
              <p className="text-gray-300 mb-4">Error loading data.</p>
              {queuesError && (
                <p className="text-sm text-gray-400 mb-4">{queuesError}</p>
              )}
              {statusesError && (
                <p className="text-sm text-gray-400 mb-4">{statusesError}</p>
              )}
              <button
                type="button"
                onClick={() => {
                  fetchQueuesData();
                  fetchStatusesData();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Dashboard board - main content */}
        {!isLoading && !hasError && (
          <DashboardBoard queues={queues} statuses={statuses} />
        )}
      </div>

      {/* Footer */}
      {!isLoading && !hasError && <Footer />}

      {/* Modals */}
      <>
        <AddQueueModal
          open={false}
          onClose={() => {}}
          onSuccess={handleAddQueueSuccess}
          statuses={statuses}
          queueId={currentQueue?.activeBatchId || ""}
        />
        <StatusManagerModal
          open={false}
          onClose={() => {}}
          onSuccess={handleStatusManagerSuccess}
          queueId={currentQueue?.activeBatchId || ""}
        />
      </>
    </div>
  );
}
