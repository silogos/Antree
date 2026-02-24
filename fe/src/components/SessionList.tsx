import type { QueueSession } from "../types";

interface SessionListProps {
  sessions: QueueSession[];
}

/**
 * SessionList Component
 * Displays a list of queue sessions with their status and details
 * Clean, minimalist design with Zed-style aesthetics
 */
export function SessionList({ sessions }: SessionListProps) {
  // Get session badge color based on status
  const getSessionBadgeColor = (status: string) => {
    const lowerStatus = status?.toLowerCase();
    switch (lowerStatus) {
      case "active":
        return "bg-green-500";
      case "paused":
        return "bg-yellow-500";
      case "completed":
      case "closed":
        return "bg-orange-500";
      case "archived":
        return "bg-gray-500";
      case "draft":
        return "bg-gray-600";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-200 mb-4">Sessions</h3>

      {sessions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">No sessions available</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-300">
                  #{session.sessionNumber}
                </span>
                <span className="text-sm text-gray-400">{session.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 text-xs font-medium text-white rounded-full ${getSessionBadgeColor(
                    session.status || session.status || "draft",
                  )}`}
                >
                  {(session.status || session.status || "draft").toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
