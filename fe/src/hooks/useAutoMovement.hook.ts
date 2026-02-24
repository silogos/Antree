import { useEffect, useRef, useState } from "react";
import type { QueueItem, QueueStatus } from "../types";

interface UseAutoMovementProps {
  queues: QueueItem[];
  statuses: QueueStatus[];
  onQueuesUpdate: (queues: QueueItem[]) => void;
  playAnnouncement?: (queueNumber: string, customerName: string) => void;
}

/**
 * Custom hook for auto-moving queues between statuses
 * Moves one queue every 15 seconds until all queues reach 'done' status
 */
export function useAutoMovement({
  queues,
  statuses,
  onQueuesUpdate,
  playAnnouncement,
}: UseAutoMovementProps) {
  const [autoMovementEnabled, setAutoMovementEnabled] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const queuesRef = useRef(queues);
  const statusesRef = useRef(statuses);
  const onQueuesUpdateRef = useRef(onQueuesUpdate);
  const playAnnouncementRef = useRef(playAnnouncement);

  // Update refs when values change
  useEffect(() => {
    queuesRef.current = queues;
    statusesRef.current = statuses;
    onQueuesUpdateRef.current = onQueuesUpdate;
    playAnnouncementRef.current = playAnnouncement;
  }, [queues, statuses, onQueuesUpdate, playAnnouncement]);

  // Start/stop interval based on enabled state
  useEffect(() => {
    if (!autoMovementEnabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      const currentQueues = queuesRef.current;
      const currentStatuses = statusesRef.current;
      const currentOnQueuesUpdate = onQueuesUpdateRef.current;
      const currentPlayAnnouncement = playAnnouncementRef.current;

      // Find the "Done" status (usually the highest order)
      const sortedStatuses = [...currentStatuses].sort(
        (a, b) => a.order - b.order,
      );
      const doneStatusId =
        sortedStatuses.length > 0
          ? sortedStatuses[sortedStatuses.length - 1].id
          : null;

      // Filter queues that are NOT in the "Done" status
      const activeQueues = doneStatusId
        ? currentQueues.filter((q) => q.statusId !== doneStatusId)
        : currentQueues;

      if (activeQueues.length === 0) {
        setAutoMovementEnabled(false);
        return;
      }

      const randomQueue =
        activeQueues[Math.floor(Math.random() * activeQueues.length)];
      const currentStatusIndex = sortedStatuses.findIndex(
        (s) => s.id === randomQueue.statusId,
      );

      if (currentStatusIndex < sortedStatuses.length - 1) {
        const nextStatusId = sortedStatuses[currentStatusIndex + 1].id;
        const updatedQueues = currentQueues.map((q) =>
          q.id === randomQueue.id ? { ...q, statusId: nextStatusId } : q,
        );
        currentOnQueuesUpdate(updatedQueues);

        // Play announcement
        if (currentPlayAnnouncement) {
          const customerName =
            randomQueue.metadata?.customerName || randomQueue.name;
          currentPlayAnnouncement(randomQueue.queueNumber, customerName);
        }
      }
    }, 15000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoMovementEnabled]);

  return {
    autoMovementEnabled,
    isMoving: autoMovementEnabled,
    toggleAutoMovement: () => setAutoMovementEnabled((prev) => !prev),
  };
}
