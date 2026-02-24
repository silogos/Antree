import type { QueueItem, QueueSessionStatus } from "@/src/types/queue.types";
import { QueueItemCard } from "./QueueCard.component";

interface SessionStatusSectionProps {
  status: QueueSessionStatus;
  queueItems: QueueItem[];
  onQueueItemClick?: (queueItem: QueueItem) => void;
}

/**
 * SessionStatusSection Component
 * Clean, minimalist status section with Zed-style design
 * Displays queue items grouped by their status
 */
export function SessionStatusSection({
  status,
  queueItems,
  onQueueItemClick,
}: SessionStatusSectionProps) {
  // Sort queue items by queue number
  const sortedQueueItems = [...queueItems].sort((a, b) => {
    const numA = parseInt(a.queueNumber.replace(/\D/g, ""), 10) || 0;
    const numB = parseInt(b.queueNumber.replace(/\D/g, ""), 10) || 0;
    return numA - numB;
  });

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
      {/* Status Header */}
      <div
        className="px-4 py-3 border-b border-gray-700 flex items-center justify-between"
        style={{
          backgroundColor: `${status.color}15`, // Add transparency
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: status.color }}
            aria-hidden="true"
          />
          <h3 className="text-lg font-semibold text-gray-200">{status.label}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-100">
            {sortedQueueItems.length}
          </span>
          <span className="text-sm text-gray-400">items</span>
        </div>
      </div>

      {/* Queue Cards */}
      <div className="p-4 min-h-[200px]">
        {sortedQueueItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 p-3 bg-gray-700 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke={status.color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8"
                aria-label="Empty list icon"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 text-center">
              No queue items in this status
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedQueueItems.map((queue) => (
              <button
                key={queue.id}
                type="button"
                onClick={() => onQueueItemClick?.(queue)}
                className="w-full text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
              >
                <QueueItemCard queue={queue} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
