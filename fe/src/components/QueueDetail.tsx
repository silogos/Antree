import {
  Activity,
  ArrowLeft,
  Calendar,
  Clock,
  Edit2,
  Pause,
  Play,
  Plus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSound } from "../hooks/useSound";
import { queueService } from "../services/queue-list.service";
import { sessionService } from "../services/session.service";
import type { Queue, QueueSession, SessionStatus } from "../types";
import { Footer } from "./Footer";
import { SessionModal } from "./SessionModal";
import { Topbar } from "./Topbar";
import { Button } from "./ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/Card";

/**
 * QueueDetail Component
 * Redesigned with modern UI, stats cards, and improved visual hierarchy
 */
export function QueueDetail() {
  const { id: queueId } = useParams<{ id: string }>();

  const [queue, setQueue] = useState<Queue | null>(null);
  const [sessions, setSessions] = useState<QueueSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<QueueSession | null>(
    null,
  );
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Sound hook
  const { soundEnabled, toggleSound } = useSound();

  // SSE connection status - not currently used for queue list view
  const sseConnected = false;

  // Fetch queue details
  useEffect(() => {
    async function fetchQueue() {
      if (!queueId) return;

      try {
        setLoading(true);
        const response = await queueService.getQueueById(queueId);

        if (response.success && response.data) {
          setQueue(response.data);
        } else {
          setError(response.error || "Failed to fetch queue details");
        }
      } catch (err) {
        console.error("Error fetching queue:", err);
        setError("Failed to fetch queue details");
      } finally {
        setLoading(false);
      }
    }

    fetchQueue();
  }, [queueId]);

  // Fetch sessions for the queue
  useEffect(() => {
    async function fetchSessions() {
      if (!queueId) return;

      try {
        const response = await sessionService.getSessions({ queueId });

        if (response.success && response.data) {
          // Sort sessions by status (active > paused > draft > completed > archived)
          // then by created time (newest first)
          const sortedSessions = [...response.data].sort((a, b) => {
            const statusOrder: Record<SessionStatus, number> = {
              active: 0,
              paused: 1,
              draft: 2,
              completed: 3,
              archived: 4,
            };

            const statusDiff =
              statusOrder[a.status as SessionStatus] -
              statusOrder[b.status as SessionStatus];

            if (statusDiff !== 0) return statusDiff;

            // Same status, sort by created time (newest first)
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });

          setSessions(sortedSessions);
        } else {
          setError(response.error || "Failed to fetch sessions");
        }
      } catch (err) {
        console.error("Error fetching sessions:", err);
        setError("Failed to fetch sessions");
      }
    }

    fetchSessions();
  }, [queueId]);

  // Refresh sessions after create/update/delete
  const refreshSessions = async () => {
    if (!queueId) return;

    try {
      const response = await sessionService.getSessions({ queueId });

      if (response.success && response.data) {
        const sortedSessions = [...response.data].sort((a, b) => {
          const statusOrder: Record<SessionStatus, number> = {
            active: 0,
            paused: 1,
            draft: 2,
            completed: 3,
            archived: 4,
          };

          const statusDiff =
            statusOrder[a.status as SessionStatus] -
            statusOrder[b.status as SessionStatus];

          if (statusDiff !== 0) return statusDiff;

          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });

        setSessions(sortedSessions);
      }
    } catch (err) {
      console.error("Error refreshing sessions:", err);
    }
  };

  // Open modal for creating a new session
  const handleCreateSession = () => {
    setEditingSession(null);
    setIsModalOpen(true);
  };

  // Open modal for editing a session
  const handleEditSession = (session: QueueSession) => {
    setEditingSession(session);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingSession(null);
  };

  // Handle successful session operation
  const handleSessionSuccess = () => {
    refreshSessions();
    setLastRefresh(new Date());
  };

  // Handle sound toggle
  const handleSoundChange = () => {
    toggleSound();
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
      draft: "bg-slate-100 text-slate-700 border-slate-200",
      active: "bg-emerald-50 text-emerald-700 border-emerald-200",
      paused: "bg-amber-50 text-amber-700 border-amber-200",
      completed: "bg-blue-50 text-blue-700 border-blue-200",
      archived: "bg-slate-100 text-slate-500 border-slate-200",
    };
    return colors[status] || colors.draft;
  };

  // Get status icon and color
  const getStatusInfo = (status: SessionStatus) => {
    const info: Record<
      SessionStatus,
      { icon: any; color: string; bg: string }
    > = {
      draft: { icon: Clock, color: "text-slate-500", bg: "bg-slate-100" },
      active: { icon: Play, color: "text-emerald-600", bg: "bg-emerald-100" },
      paused: { icon: Pause, color: "text-amber-600", bg: "bg-amber-100" },
      completed: { icon: Calendar, color: "text-blue-600", bg: "bg-blue-100" },
      archived: { icon: Clock, color: "text-slate-400", bg: "bg-slate-50" },
    };
    return info[status] || info.draft;
  };

  // Get status label
  const getStatusLabel = (status: SessionStatus) => {
    const labels: Record<SessionStatus, string> = {
      draft: "Draft",
      active: "Active",
      paused: "Paused",
      completed: "Completed",
      archived: "Archived",
    };
    return labels[status] || status;
  };

  // Calculate stats
  const stats = {
    total: sessions.length,
    active: sessions.filter((s) => s.status === "active").length,
    completed: sessions.filter((s) => s.status === "completed").length,
    paused: sessions.filter((s) => s.status === "paused").length,
  };

  // Invalid queueId
  if (!queueId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-slate-200 max-w-md">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-slate-800">
            Invalid Queue
          </h2>
          <p className="text-slate-500 mb-6">No queue ID provided.</p>
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
          <p className="text-slate-500 font-medium">Loading queue details...</p>
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
        title={queue?.name || "Queue Details"}
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
              to="/"
              className="inline-flex items-center text-slate-600 hover:text-slate-800 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Queue List
            </Link>
          </div>

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">
                      Total Sessions
                    </p>
                    <p className="text-3xl font-bold text-slate-900">
                      {stats.total}
                    </p>
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
                    <p className="text-sm font-medium text-slate-500 mb-1">
                      Active
                    </p>
                    <p className="text-3xl font-bold text-emerald-600">
                      {stats.active}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Play className="w-6 h-6 text-emerald-600 fill-current" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">
                      Completed
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {stats.completed}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">
                      Paused
                    </p>
                    <p className="text-3xl font-bold text-amber-600">
                      {stats.paused}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Pause className="w-6 h-6 text-amber-600 fill-current" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Queue Info Card */}
          <Card className="border-slate-200 shadow-sm mb-6">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl font-semibold text-slate-900 mb-1">
                    {queue?.name}
                  </CardTitle>
                  <CardDescription className="text-slate-500">
                    Queue created on {queue ? formatDate(queue.createdAt) : "-"}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {queue?.isActive ? (
                    <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span>
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs font-medium text-slate-500 mb-1">
                    Queue ID
                  </p>
                  <p
                    className="text-sm font-mono text-slate-700 truncate"
                    title={queue?.id}
                  >
                    {queue?.id}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs font-medium text-slate-500 mb-1">
                    Template ID
                  </p>
                  <p
                    className="text-sm font-mono text-slate-700 truncate"
                    title={queue?.templateId}
                  >
                    {queue?.templateId}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs font-medium text-slate-500 mb-1">
                    Last Updated
                  </p>
                  <p className="text-sm text-slate-700">
                    {queue ? formatRelativeTime(queue.updatedAt) : "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sessions List */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-slate-900">
                    Sessions
                  </CardTitle>
                  <CardDescription className="text-slate-500">
                    Manage your queue sessions
                  </CardDescription>
                </div>
                <Button
                  onClick={handleCreateSession}
                  size="sm"
                  className="flex items-center gap-2 shadow-sm hover:shadow transition-shadow"
                >
                  <Plus size={16} />
                  Create Session
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {sessions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    No sessions yet
                  </h3>
                  <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                    Create your first session to start managing queues
                  </p>
                  <Button
                    onClick={handleCreateSession}
                    className="shadow-sm hover:shadow transition-shadow"
                  >
                    <Plus size={16} className="mr-2" />
                    Create First Session
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {sessions.map((session) => {
                    const statusInfo = getStatusInfo(
                      session.status as SessionStatus,
                    );
                    const StatusIcon = statusInfo.icon;

                    return (
                      <Card
                        key={session.id}
                        className="border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusInfo.bg} shrink-0`}
                              >
                                <StatusIcon
                                  className={`w-5 h-5 ${statusInfo.color}`}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-slate-900 truncate mb-1">
                                  {session.name}
                                </h3>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeColor(
                                      session.status as SessionStatus,
                                    )}`}
                                  >
                                    {getStatusLabel(
                                      session.status as SessionStatus,
                                    )}
                                  </span>
                                  {session.sessionNumber && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-200">
                                      #{session.sessionNumber}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditSession(session)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Edit session"
                              >
                                <Edit2 size={16} />
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="p-2.5 bg-slate-50 rounded-lg">
                              <p className="text-xs font-medium text-slate-500 mb-1">
                                Created
                              </p>
                              <p className="font-medium text-slate-700">
                                {formatRelativeTime(session.createdAt)}
                              </p>
                            </div>
                            <div className="p-2.5 bg-slate-50 rounded-lg">
                              <p className="text-xs font-medium text-slate-500 mb-1">
                                Session ID
                              </p>
                              <p
                                className="font-medium text-slate-700 font-mono text-xs truncate"
                                title={session.id}
                              >
                                {session.id.slice(0, 8)}...
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <Link
                              to={`/sessions/${session.id}`}
                              className="inline-flex items-center w-full justify-center px-4 py-2.5 bg-white text-blue-600 font-medium rounded-lg border border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all"
                            >
                              View Details
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Session Modal */}
          {/* <SessionModal
            open={isModalOpen}
            onClose={handleModalClose}
            onSuccess={handleSessionSuccess}
            queueId={queueId}
            queueTemplateId={queue?.templateId}
            session={editingSession}
          /> */}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
