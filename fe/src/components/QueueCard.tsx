import type { QueueItem } from "../types";

interface QueueCardProps {
  queue: QueueItem;
}

/**
 * QueueCard Component
 * Clean, minimalist customer card with Zed-style design
 */
export function QueueCard({ queue }: QueueCardProps) {
  const customerName = queue.metadata?.customerName || queue.name;

  return (
    <div className="bg-gray-800 border border-gray-700 p-4 hover:bg-gray-750 transition-colors cursor-grab active:cursor-grabbing">
      {/* Queue Header */}
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold text-gray-200">
          {queue.queueNumber}
        </span>
        <span className="text-base font-medium text-gray-100">
          {customerName}
        </span>
      </div>
    </div>
  );
}
