import { useEffect, useState } from "react";
import { Plus, Activity, LayoutGrid, CheckCircle, AlertCircle, Info, Loader2 } from "lucide-react";
import { useQueueList } from "../hooks/useQueueList.hook";
import type { Queue } from "@/src/types/queue.types";
import { useToast } from "../hooks/use-toast.hook";
import { Button } from "./ui/Button.component";
import { Footer } from "./Footer.component";
import { QueueBoardCard } from "./QueueBoardCard.component";

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
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Loading queues...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-slate-200 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-slate-800">Error</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <button
            type="button"
            onClick={fetchQueues}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (queues.length === 0)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-slate-200 max-w-md">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LayoutGrid className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-slate-800">No Queues Found</h2>
          <p className="text-slate-500 mb-4">
            Create a queue to get started with queue management.
          </p>
          <p className="text-sm text-slate-400 mb-6">
            Hint: Use the backend seed script to create initial queues.
          </p>
          <Button className="shadow-sm hover:shadow transition-shadow">
            <Plus size={16} className="mr-2" />
            Create First Queue
          </Button>
        </div>
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {queues.map((queue: Queue) => (
        <QueueBoardCard key={queue.id} queue={queue} />
      ))}
    </div>
  );
};

/**
 * BoardList Component
 * Displays all available queues as clickable cards with modern design
 * Shown at root route (/)
 */
export function BoardList() {
  const queueList = useQueueList();
  const { success, error, info, warning, loading } = useToast();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Fetch queues on mount - only run once
    queueList.fetchQueues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queueList.fetchQueues]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header - BoardList's own header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Title and Time */}
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-100">Queue Boards</h1>
              <div className="hidden sm:block text-sm text-gray-400 font-mono">
                {formatTime(currentTime)}
              </div>
            </div>

            {/* Right side - New Queue Button */}
            <Button
              size="sm"
              className="shadow-sm hover:shadow transition-shadow hidden sm:flex"
            >
              <Plus size={16} className="mr-2" />
              New Queue
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 min-h-0">
        {/* Queue Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Toast Demo Section */}
          <div className="mb-8 p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Toast Notification Demo</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => success("Success!", { description: "This is a success toast notification." })}
              >
                <CheckCircle size={14} className="mr-1" />
                Success
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => error("Error!", { description: "This is an error toast notification." })}
              >
                <AlertCircle size={14} className="mr-1" />
                Error
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => info("Info", { description: "This is an info toast notification." })}
              >
                <Info size={14} className="mr-1" />
                Info
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => warning("Warning!", { description: "This is a warning toast notification." })}
              >
                <AlertCircle size={14} className="mr-1" />
                Warning
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  loading("Loading...", { id: "loading-demo", description: "Please wait..." });
                  setTimeout(() => {
                    success("Completed!", { id: "loading-demo", description: "Operation finished successfully." });
                  }, 2000);
                }}
              >
                <Loader2 size={14} className="mr-1" />
                Loading
              </Button>
            </div>
          </div>

          {renderContent(queueList)}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
