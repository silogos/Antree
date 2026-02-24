import { sessionService } from "../services/session.service";
import { type QueueSession, SessionLifecycle } from "../types";

interface SessionLifecycleControlsProps {
  session: QueueSession;
  onLifecycleChange?: (session: QueueSession) => void;
}

/**
 * SessionLifecycleControls Component
 * Manages session lifecycle transitions (draft → active → closed)
 * with status display and history timeline
 */
export function SessionLifecycleControls({
  session,
  onLifecycleChange,
}: SessionLifecycleControlsProps) {
  const { id, status: sessionStatus, createdAt, updatedAt, sessionNumber } = session;

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get badge color based on status
  const getBadgeColor = (status?: SessionLifecycle) => {
    if (!status) return "bg-gray-500";
    switch (status) {
      case "active":
        return "bg-green-500";
      case "paused":
        return "bg-yellow-500";
      case "completed":
      case "closed":
        return "bg-orange-500";
      case "draft":
        return "bg-gray-600";
      case "archived":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  // Handle lifecycle transitions
  const handleLifecycleChange = async (newLifecycle: SessionLifecycle) => {
    try {
      const updatedSession = await sessionService.updateSessionLifecycle(
        id,
        newLifecycle,
      );
      if (updatedSession.data) {
        onLifecycleChange?.(updatedSession.data);
      }
    } catch (error) {
      console.error("Failed to update session lifecycle:", error);
      // Error handling would be implemented here
    }
  };

  // Get available transitions based on current status
  const getAvailableTransitions = () => {
    const currentStatus = (sessionStatus || SessionLifecycle.DRAFT);

    switch (currentStatus) {
      case SessionLifecycle.DRAFT:
        return [
          {
            to: SessionLifecycle.ACTIVE,
            label: "Activate",
            action: () => handleLifecycleChange(SessionLifecycle.ACTIVE),
          },
        ];
      case SessionLifecycle.ACTIVE:
        return [
          {
            to: SessionLifecycle.PAUSED,
            label: "Pause",
            action: () => handleLifecycleChange(SessionLifecycle.PAUSED),
          },
          {
            to: SessionLifecycle.COMPLETED,
            label: "Complete",
            action: () => handleLifecycleChange(SessionLifecycle.COMPLETED),
          },
        ];
      case SessionLifecycle.PAUSED:
        return [
          {
            to: SessionLifecycle.ACTIVE,
            label: "Resume",
            action: () => handleLifecycleChange(SessionLifecycle.ACTIVE),
          },
          {
            to: SessionLifecycle.COMPLETED,
            label: "Complete",
            action: () => handleLifecycleChange(SessionLifecycle.COMPLETED),
          },
        ];
      case SessionLifecycle.COMPLETED:
        return [
          {
            to: SessionLifecycle.DRAFT,
            label: "Reset",
            action: () => handleLifecycleChange(SessionLifecycle.DRAFT),
          },
        ];
      case SessionLifecycle.SESSION_CLOSED:
        return [
          {
            to: SessionLifecycle.DRAFT,
            label: "Reset",
            action: () => handleLifecycleChange(SessionLifecycle.DRAFT),
          },
        ];
    // Get available transitions
    const transitions = getAvailableTransitions();

    return (
      <div className="w-full">
        {/* Header with status badge */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Session Lifecycle</h3>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getBadgeColor(currentStatus)}`}>
              {currentStatus.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full bg-gray-500"></span>
            <span className="text-gray-300">Draft</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="text-gray-300">Active</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
            <span className="text-gray-300">Completed / Closed</span>
          </div>
        </div>

        {/* Action buttons based on current status */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-white mb-3">Available Actions</h4>
          <div className="grid grid-cols-2 gap-3">
            {transitions.map((transition) => (
              <button
                key={transition.to}
                onClick={transition.action}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {transition.label}
              </button>
            ))}
          </div>
        </div>

        {/* Session details */}
        <div className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Session Number:</span>
            <span className="text-white">{sessionNumber ?? "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Created:</span>
            <span className="text-white">{formatDate(createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Updated:</span>
            <span className="text-white">{formatDate(updatedAt)}</span>
          </div>
        </div>
      </div>
    );
  }
}
}
