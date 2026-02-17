import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQueueList } from "../hooks/useQueueList";
import type { Queue } from "../types";

const renderContent = ({
  queues,
  error,
  loading,
  fetchQueues,
}: ReturnType<typeof useQueueList>) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading queues...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-gray-700 rounded-lg max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-white">Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            type="button"
            onClick={fetchQueues}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (queues.length === 0)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-gray-700 rounded-lg max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-white">No Queues Found</h2>
          <p className="text-gray-300 mb-4">
            Create a queue to get started with queue management.
          </p>
          <p className="text-sm text-gray-400">
            Hint: Use the backend seed script to create initial queues.
          </p>
        </div>
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {queues.map((queue: Queue) => (
        <Link
          key={queue.id}
          to={`/queues/${queue.id}`}
          className="block p-6 bg-gray-700 rounded-lg border border-gray-600 hover:border-blue-500 hover:shadow-lg transition-all duration-200"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-2">
                {queue.name}
              </h3>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    queue.isActive
                      ? "bg-green-900 text-green-300"
                      : "bg-gray-600 text-gray-300"
                  }`}
                >
                  {queue.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <title>arrow</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-600">
            <p className="text-sm text-gray-400">
              Created: {new Date(queue.createdAt).toLocaleDateString()}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};

/**
 * BoardList Component
 * Displays all available queues as clickable cards
 * Shown at root route (/)
 */
export function BoardList() {
  const queueList = useQueueList();

  useEffect(() => {
    queueList.fetchQueues();
  }, [queueList.fetchQueues]);

  return (
    <div className="min-h-screen bg-gray-800">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-white">Queue Boards</h1>
          <p className="text-gray-400 mt-2">
            Select a queue to manage its batches
          </p>
        </div>
      </div>

      {/* Queue Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent(queueList)}
      </div>
    </div>
  );
}
