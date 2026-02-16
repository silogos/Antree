import { useMemo } from "react";
import type { QueueItem, QueueStatus } from "../types";
import { StatusSection } from "./StatusColumn";

interface DashboardBoardProps {
  queues: QueueItem[];
  statuses: QueueStatus[];
}

/**
 * DashboardBoard Component
 * Clean, minimalist layout with Zed-style design
 */
export function DashboardBoard({ queues, statuses }: DashboardBoardProps) {
  /**
   * Sort queues by queue number
   */
  const sortedQueues = useMemo(() => {
    return [...queues].sort((a, b) => {
      const numA = parseInt(a.queueNumber, 10);
      const numB = parseInt(b.queueNumber, 10);
      return numA - numB;
    });
  }, [queues]);

  /**
   * Group queues by status
   */
  const queuesByStatus = useMemo(() => {
    const grouped = new Map<string, QueueItem[]>();

    statuses.forEach((status) => {
      grouped.set(status.id, []);
    });

    sortedQueues.forEach((queue) => {
      const statusQueues = grouped.get(queue.statusId) || [];
      statusQueues.push(queue);
      grouped.set(queue.statusId, statusQueues);
    });

    return grouped;
  }, [sortedQueues, statuses]);

  return (
    <div className="h-full overflow-y-auto">
      {/* Status Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3">
        {statuses.map((status) => (
          <StatusSection
            key={status.id}
            status={status}
            queues={queuesByStatus.get(status.id) || []}
          />
        ))}
      </div>
    </div>
  );
}
