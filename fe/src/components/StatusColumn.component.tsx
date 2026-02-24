import { memo } from "react";
import type { QueueItem, QueueStatus } from "../types";
import { QueueItemCard } from "./QueueCard";

interface StatusSectionProps {
  status: QueueStatus;
  queues: QueueItem[];
}

/**
 * StatusSection Component
 * Clean, minimalist status section with Zed-style design
 * Memoized to prevent unnecessary re-renders during drag-and-drop
 */
export const StatusSection = memo<StatusSectionProps>(({ status, queues }) => {
  return (
    <div className="bg-gray-800 border border-gray-700 p-6">
      {/* Status Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: status.color }}
            aria-hidden="true"
          />
          <h3 className="text-lg font-medium text-gray-200">{status.label}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-semibold text-gray-100">{queues.length}</span>
          <span className="text-sm text-gray-400">items</span>
        </div>
      </div>

      {/* Queue Cards */}
      <div className="space-y-3">
        {queues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
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
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 text-center">No queues in this status</p>
          </div>
        ) : (
          queues.map((queue) => <QueueItemCard key={queue.id} queue={queue} />)
        )}
      </div>
    </div>
  );
});

StatusSection.displayName = "StatusSection";
