import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Plus, ArrowLeft, Users, Activity, Play, Pause, CheckCircle2, Archive } from "lucide-react";
import { sessionService } from "../services/session.service";
import { queueItemService } from "../services/queue.service";
import { useSound } from "../hooks/useSound.hook";
import { useSessionSSE } from "../hooks/useSessionSSE.hook";


import { Button } from "./ui/Button.component";
import { Footer } from "./Footer.component";
import { AddQueueModal } from "./AddQueueModal.component";
import { QueueItemStatusModal } from "./QueueItemStatusModal.component";
import { Topbar } from "./Topbar.component";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/Card.component";
import { SessionStatusSection } from "./SessionStatusSection.component";
import { useToast } from "../hooks/use-toast.hook";
import type { QueueSession, QueueSessionStatus, QueueItem, SessionStatus } from "../types/queue.types";

/**
 * SessionDetail Component
 * Displays session information with kanban board for queue items
 * Real-time updates via SSE
 */
export function SessionDetail() {
  const { id: sessionId } = useParams<{ id: string }>();

  const [session, setSession] = useState<QueueSession | null>(null);
  const [statuses, setStatuses] = useState<QueueSessionStatus[]>([]);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQueueItem, setSelectedQueueItem] = useState<QueueItem | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [lifecycleLoading, setLifecycleLoading] = useState(false);

  // Sound hook
  const { soundEnabled, toggleSound } = useSound();
  const { success, error: showError } = useToast();

  // SSE integration for real-time updates
  const { isConnected: sseConnected } = useSessionSSE(
    sessionId || null,
    {
      onQueueItemCreated: (item) => {
        setQueueItems((prev) => [...prev, item]);
        playNotificationSound();
      },
      onQueueItemUpdated: (item) => {
        setQueueItems((prev) =>
          prev.map((q) => (q.id === item.id ? item : q)),
        );
      },
      onQueueItemStatusChanged: (item) => {
        setQueueItems((prev) =>
          prev.map((q) => (q.id === item.id ? item : q)),
        );
        playNotificationSound();
      },
      onQueueItemDeleted: (data) => {
        setQueueItems((prev) => prev.filter((q) => q.id !== data.id));
      },
      onSessionUpdated: (updatedSession) => {
        setSession(updatedSession);
      },
      onStatusCreated: (status: any) => {
        setStatuses((prev) => [...prev, status]);
      },
      onStatusUpdated: (status: any) => {
        setStatuses((prev) =>
          prev.map((s) => (s.id === status.id ? status : s)),
        );
      },
      onStatusDeleted: (data: any) => {
        setStatuses((prev) => prev.filter((s) => s.id !== data.id));
      },
    },
  );

  // Play notification sound
  const playNotificationSound = () => {
    // Sound is handled by useSound hook internally
    // This is a placeholder for future customization
  };

  // Fetch session details
  useEffect(() => {
    async function fetchSession() {
      if (!sessionId) return;

      try {
        setLoading(true);
        const response = await sessionService.getSessionById(sessionId);

        if (response.success && response.data) {
          setSession(response.data);
        } else {
          setError(response.error || "Failed to fetch session details");
        }
      } catch (err) {
        console.error("Error fetching session:", err);
        setError("Failed to fetch session details");
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, [sessionId]);

  // Fetch session statuses
  useEffect(() => {
    async function fetchStatuses() {
      if (!sessionId) return;

      try {
        const response = await sessionService.getSessionStatuses(sessionId);
        if (response.success && response.data) {
          setStatuses(response.data);
        }
      } catch (err) {
        console.error("Error fetching statuses:", err);
      }
    }

    fetchStatuses();
  }, [sessionId]);

  // Fetch queue items for the session
  useEffect(() => {
    async function fetchQueueItems() {
      if (!sessionId) return;

      try {
        const response = await queueItemService.getQueueItems({
          sessionId: sessionId,
        });

        if (response.success && response.data) {
          setQueueItems(response.data);
        }
      } catch (err) {
        console.error("Error fetching queue items:", err);
      }
    }

    fetchQueueItems();
  }, [sessionId]);

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  // Handle queue item creation
  const handleCreateQueueItem = async (data: any) => {
    if (!sessionId) return;
    const response = await queueItemService.createQueueItemViaSession(
      sessionId,
      data,
    );
    if (!response.success) {
      throw new Error(response.error || "Failed to create queue item");
    }
  };

  // Handle successful queue item creation
  const handleQueueItemSuccess = () => {
    setLastRefresh(new Date());
    // SSE will handle the data update
  };

  // Handle queue item click
  const handleQueueItemClick = (queueItem: QueueItem) => {
    setSelectedQueueItem(queueItem);
    setIsStatusModalOpen(true);
  };

  // Handle status modal close
  const handleStatusModalClose = () => {
    setIsStatusModalOpen(false);
    setSelectedQueueItem(null);
  };

  // Handle status update success
  const handleStatusUpdateSuccess = () => {
    setLastRefresh(new Date());
    // SSE will handle the data update
  };

  // Handle sound toggle
  const handleSoundChange = () => {
    toggleSound();
  };

  // Handle session lifecycle change
  const handleLifecycleChange = async (status: SessionStatus) => {
    if (!session || !sessionId) return;

    try {
      setLifecycleLoading(true);
      const response = await sessionService.updateSessionLifecycle(sessionId, { status });

      if (response.success && response.data) {
        setSession(response.data);
        success(`Session ${status}!`, {
          description: `Session "${session.name}" is now ${status}`,
        });
      } else {
        throw new Error(response.error || "Failed to update session");
      }
    } catch (err) {
      console.error("Error updating session lifecycle:", err);
      showError("Failed to update session", {
        description: "Please try again later.",
      });
    } finally {
      setLifecycleLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  // Get status badge color
  const getStatusBadgeColor = (status: SessionStatus) => {
    const colors: Record<SessionStatus, string> = {
      [SessionStatus.DRAFT]: "bg-slate-100 text-slate-700 border-slate-200",
      [SessionStatus.ACTIVE]: "bg-emerald-50 text-emerald-700 border-emerald-200",
      [SessionStatus.PAUSED]: "bg-amber-50 text-amber-700 border-amber-200",
      [SessionStatus.COMPLETED]: "bg-blue-50 text-blue-700 border-blue-200",
      [SessionStatus.ARCHIVED]: "bg-slate-100 text-slate-500 border-slate-200",
    };
    return colors[status] || colors[SessionStatus.DRAFT];
  };

  // Calculate stats
  const stats = {
    total: queueItems.length,
    statuses: statuses.length,
    active: session?.status === "active" ? 1 : 0,
  };

  // Invalid sessionId
  if (!sessionId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-slate-200 max-w-md">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-slate-800">Invalid Session</h2>
          <p className="text-slate-500 mb-6">No session ID provided.</p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow"
          >
            Go to Queue List
          </Link>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Loading session details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-slate-200 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-slate-800">Error</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow"
          >
            Go to Queue List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Topbar */}
      <Topbar
        title={session?.name || "Session Details"}
        lastRefresh={lastRefresh}
        soundEnabled={soundEnabled}
        onToggleSound={handleSoundChange}
        autoMovementEnabled={false}
        onToggleAutoMovement={undefined}
        sseConnected={sseConnected}
      />

      {/* Main Content */}
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header with back button */}
          <div className="mb-6">
            <Link
              to={`/queues/${session?.queueId}`}
              className="inline-flex items-center text-slate-600 hover:text-slate-800 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Queue
            </Link>
          </div>

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Queue Items</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Statuses</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.statuses}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Session Status</p>
                    <p className="text-3xl font-bold capitalize text-slate-900">
                      {session?.status || "Unknown"}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    {session?.status === "active" ? (
                      <Play className="w-6 h-6 text-green-600 fill-current" />
                    ) : (
                      <Pause className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Session Info Card */}
          <Card className="border-slate-200 shadow-sm mb-6">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl font-semibold text-slate-900 mb-1">
                    {session?.name}
                  </CardTitle>
                  <CardDescription className="text-slate-500">
                    {session?.sessionNumber && `Session #${session.sessionNumber} • `}
                    Created on {session ? formatDate(session.createdAt) : "-"}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {session && (
                    <>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeColor(
                          session.status as SessionStatus,
                        )}`}
                      >
                        {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                      </span>

                      {/* Lifecycle Controls */}
                      <div className="flex items-center gap-2">
                        {session.status === SessionStatus.DRAFT && (
                          <Button
                            size="sm"
                            onClick={() => handleLifecycleChange(SessionStatus.ACTIVE)}
                            disabled={lifecycleLoading}
                            className="shadow-sm hover:shadow transition-shadow"
                          >
                            <Play size={16} className="mr-1" />
                            Start
                          </Button>
                        )}
                        {session.status === SessionStatus.ACTIVE && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleLifecycleChange(SessionStatus.PAUSED)}
                            disabled={lifecycleLoading}
                            className="shadow-sm hover:shadow transition-shadow"
                          >
                            <Pause size={16} className="mr-1" />
                            Pause
                          </Button>
                        )}
                        {session.status === SessionStatus.PAUSED && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleLifecycleChange(SessionStatus.ACTIVE)}
                              disabled={lifecycleLoading}
                              className="shadow-sm hover:shadow transition-shadow"
                            >
                              <Play size={16} className="mr-1" />
                              Resume
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleLifecycleChange(SessionStatus.COMPLETED)}
                              disabled={lifecycleLoading}
                              className="shadow-sm hover:shadow transition-shadow"
                            >
                              <CheckCircle2 size={16} className="mr-1" />
                              Complete
                            </Button>
                          </>
                        )}
                        {(session.status === SessionStatus.ACTIVE ||
                          session.status === SessionStatus.PAUSED) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleLifecycleChange(SessionStatus.ARCHIVED)}
                              disabled={lifecycleLoading}
                              className="shadow-sm hover:shadow transition-shadow"
                            >
                              <Archive size={16} className="mr-1" />
                              Archive
                            </Button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs font-medium text-slate-500 mb-1">Session ID</p>
                  <p className="text-sm font-mono text-slate-700 truncate" title={session?.id}>
                    {session?.id}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs font-medium text-slate-500 mb-1">Queue ID</p>
                  <p className="text-sm font-mono text-slate-700 truncate" title={session?.queueId}>
                    {session?.queueId}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs font-medium text-slate-500 mb-1">Last Updated</p>
                  <p className="text-sm text-slate-700">
                    {session ? formatRelativeTime(session.updatedAt) : "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kanban Board */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-slate-900">
                    Queue Items
                  </CardTitle>
                  <CardDescription className="text-slate-500">
                    Manage queue items with real-time updates
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setIsModalOpen(true)}
                  size="sm"
                  className="flex items-center gap-2 shadow-sm hover:shadow transition-shadow"
                >
                  <Plus size={16} />
                  Add Queue Item
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {statuses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">No statuses configured</h3>
                  <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                    This session doesn't have any statuses configured yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {statuses
                    .sort((a, b) => a.order - b.order)
                    .map((status) => (
                      <SessionStatusSection
                        key={status.id}
                        status={status}
                        queueItems={queueItems.filter((item) => item.statusId === status.id)}
                        onQueueItemClick={handleQueueItemClick}
                      />
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add Queue Modal */}
          {sessionId && session && (
            <AddQueueModal
              open={isModalOpen}
              onClose={handleModalClose}
              onSuccess={handleQueueItemSuccess}
              sessionId={sessionId}
              onCreate={handleCreateQueueItem}
              statuses={statuses.map((s) => ({
                id: s.id,
                queueId: session.queueId,
                templateStatusId: s.templateStatusId || undefined,
                label: s.label,
                color: s.color,
                order: s.order,
                createdAt: s.createdAt,
                updatedAt: s.updatedAt,
              }))}
            />
          )}

          {/* Queue Item Status Modal */}
          {selectedQueueItem && (
            <QueueItemStatusModal
              open={isStatusModalOpen}
              onClose={handleStatusModalClose}
              onSuccess={handleStatusUpdateSuccess}
              queueItem={selectedQueueItem}
              statuses={statuses.map((s) => ({
                id: s.id,
                queueId: session?.queueId || "",
                templateStatusId: s.templateStatusId || undefined,
                label: s.label,
                color: s.color,
                order: s.order,
                createdAt: s.createdAt,
                updatedAt: s.updatedAt,
              }))}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
