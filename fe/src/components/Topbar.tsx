import { useEffect, useState } from "react";

interface TopbarProps {
  title: string;
  lastRefresh: Date | null;
  soundEnabled: boolean;
  onToggleSound?: () => void;
  autoMovementEnabled: boolean;
  onToggleAutoMovement?: () => void;
  boardSelector?: React.ReactNode;
  sseConnected?: boolean;
}

export function Topbar({
  title,
  lastRefresh,
  soundEnabled,
  onToggleSound,
  autoMovementEnabled,
  onToggleAutoMovement,
  boardSelector,
  sseConnected = false,
}: TopbarProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Title and Time */}
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-100">{title}</h1>
            <div className="hidden sm:block text-sm text-gray-400 font-mono">
              {formatTime(currentTime)}
            </div>
            {boardSelector && (
              <div className="hidden sm:block">{boardSelector}</div>
            )}
          </div>

          {/* Right side - Controls and Status */}
          <div className="flex items-center gap-4">
            {/* SSE Connection Status */}
            {sseConnected !== undefined && (
              <div className="flex items-center gap-2 text-sm">
                <div
                  className={`w-2 h-2 rounded-full ${sseConnected ? "bg-green-400 animate-pulse" : "bg-red-400"}`}
                />
                <span className="text-xs text-gray-400 hidden sm:inline">
                  {sseConnected ? "Live" : "Offline"}
                </span>
              </div>
            )}

            {lastRefresh && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-xs">Last refresh:</span>
                <span className="text-xs text-gray-500">
                  {formatDate(lastRefresh)}
                </span>
              </div>
            )}

            {/* Sound Toggle */}
            {onToggleSound && (
              <button
                onClick={onToggleSound}
                className="flex items-center gap-2 px-3 py-1.5 rounded text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-4 h-4 ${soundEnabled ? "text-green-400" : "text-red-400"}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {soundEnabled ? (
                    <>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                    </>
                  ) : (
                    <>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 14l2-2m0 0l2 2m-2-2v6"
                      />
                    </>
                  )}
                </svg>
                <span className="text-xs">
                  {soundEnabled ? "Sound On" : "Sound Off"}
                </span>
              </button>
            )}

            {/* Auto Movement Toggle */}
            {onToggleAutoMovement && (
              <button
                onClick={onToggleAutoMovement}
                className="flex items-center gap-2 px-3 py-1.5 rounded text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    autoMovementEnabled
                      ? "bg-green-400 animate-pulse"
                      : "bg-gray-600"
                  }`}
                />
                <span
                  className={`text-xs ${autoMovementEnabled ? "text-green-400" : "text-gray-500"}`}
                >
                  Auto Move
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
