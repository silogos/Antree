import { useState } from "react";

/**
 * Custom hook for auto-refreshing queues
 * Tracks the last refresh time and provides refresh functionality
 */
export function useAutoRefresh() {
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  /**
   * Refresh queues from the service
   * Updates the lastRefresh timestamp
   */
  const refreshQueues = () => {
    setLastRefresh(new Date());
    // The actual queue fetching would be done in the component
    // This hook just tracks the refresh time
  };

  return {
    lastRefresh,
    refreshQueues,
  };
}
