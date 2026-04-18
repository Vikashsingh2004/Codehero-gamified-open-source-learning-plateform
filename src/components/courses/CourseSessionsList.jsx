import React, { useState, useEffect, useCallback } from "react";
import { Calendar, Clock, Users, Video, Plus, Radio, AlertTriangle } from "lucide-react";
import { courseSessionsAPI } from "../../services/api";
import { VideoCall } from "../VideoCall";
import CreateSessionForm from "./CreateSessionForm";

function computeStatus(session) {
  const now = new Date();
  const start = new Date(session.scheduledAt);
  const end = new Date(session.endTime);
  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "live";
  return "expired";
}

const CourseSessionsList = ({ course, currentUser }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [warning, setWarning] = useState("");
  const [activeVideoRoom, setActiveVideoRoom] = useState(null);

  const currentUserId = currentUser?._id?.toString() || currentUser?.id?.toString();
  const isMentor = course.createdBy?._id?.toString() === currentUserId ||
    course.createdBy?.toString() === currentUserId;
  const isEnrolled = course.enrolledUsers?.some(
    (u) => u._id?.toString() === currentUserId || u.toString() === currentUserId
  );
  const hasAccess = isMentor || isEnrolled;

  const showWarning = (msg) => {
    setWarning(msg);
    setTimeout(() => setWarning(""), 4000);
  };

  const fetchSessions = useCallback(async () => {
    if (!hasAccess) return;
    try {
      const res = await courseSessionsAPI.getAll(course._id);
      setSessions(res.data.filter((s) => computeStatus(s) !== "expired"));
    } catch (err) {
      console.error("Failed to fetch course sessions:", err);
    } finally {
      setLoading(false);
    }
  }, [course._id, hasAccess]);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(() => {
      setSessions((prev) => prev.filter((s) => computeStatus(s) !== "expired"));
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  const handleCreateSession = async (formData) => {
    try {
      const res = await courseSessionsAPI.create(course._id, formData);
      setSessions((prev) => [res.data, ...prev]);
      setShowCreateForm(false);
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || "Failed to create session");
    }
  };

  const handleJoinSession = async (sessionId) => {
    const session = sessions.find((s) => (s.id || s._id) === sessionId);
    if (!session) return;

    const status = computeStatus(session);
    if (status !== "live") {
      showWarning("Session is not live yet or has already ended.");
      return;
    }

    try {
      const res = await courseSessionsAPI.join(course._id, sessionId);
      setSessions((prev) =>
        prev.map((s) => ((s.id || s._id) === sessionId ? res.data : s))
      );
      setActiveVideoRoom(sessionId);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Failed to join session";
      showWarning(msg);
    }
  };

  const handleJoinMeeting = (sessionId) => {
    const session = sessions.find((s) => (s.id || s._id) === sessionId);
    if (!session) return;
    const status = computeStatus(session);
    if (status !== "live") {
      showWarning("Session is not live yet or has already ended.");
      return;
    }
    setActiveVideoRoom(sessionId);
  };

  if (activeVideoRoom) {
    const activeSession = sessions.find((s) => (s.id || s._id) === activeVideoRoom);
    const isSessionHost = activeSession?.hostId?.toString() === currentUserId;
    return (
      <VideoCall
        sessionId={activeVideoRoom}
        isHost={isSessionHost}
        onLeave={() => setActiveVideoRoom(null)}
      />
    );
  }

  if (!hasAccess) {
    return (
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Course Sessions</h3>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          Enroll in this course to access live sessions.
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      {warning && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-amber-50 border border-amber-300 text-amber-800 px-5 py-3 rounded-xl shadow-lg text-sm font-medium">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-500" />
          {warning}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Course Sessions</h3>
        {isMentor && !showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Session
          </button>
        )}
      </div>

      {showCreateForm && (
        <CreateSessionForm
          onSubmit={handleCreateSession}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {loading ? (
        <p className="text-gray-500 text-sm py-4">Loading sessions...</p>
      ) : sessions.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <Video className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No upcoming sessions</p>
          {isMentor && (
            <p className="text-gray-400 text-xs mt-1">Create a session to meet with your students live</p>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {sessions.map((session) => {
            const sessionId = session.id || session._id;
            const status = computeStatus(session);
            const isAttending = session.attendees?.includes(currentUserId);
            const isHost = session.hostId?.toString() === currentUserId;
            const isLive = status === "live";

            const statusConfig = {
              upcoming: { label: "Upcoming", classes: "bg-blue-100 text-blue-700" },
              live: { label: "Live", classes: "bg-green-100 text-green-700" },
            };
            const cfg = statusConfig[status] || statusConfig.upcoming;

            return (
              <div
                key={sessionId}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 leading-tight">{session.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ml-2 flex-shrink-0 flex items-center gap-1 font-medium ${cfg.classes}`}>
                    {isLive && <Radio className="w-3 h-3" />}
                    {cfg.label}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{session.description}</p>
                <div className="space-y-1 text-xs text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                    {new Date(session.scheduledAt).toLocaleString()}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                    {session.duration} mins
                  </div>
                  <div className="flex items-center">
                    <Users className="w-3.5 h-3.5 mr-1.5" />
                    {session.attendees?.length || 0} / {session.capacity} attendees
                  </div>
                </div>

                {!isAttending && !isHost && (
                  <button
                    onClick={() => handleJoinSession(sessionId)}
                    disabled={!isLive}
                    title={!isLive ? "Session is not live yet or has already ended." : ""}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                      isLive
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {isLive ? "Join Session" : "Not Live Yet"}
                  </button>
                )}

                {(isAttending || isHost) && (
                  <button
                    onClick={() => handleJoinMeeting(sessionId)}
                    disabled={!isLive}
                    title={!isLive ? "Session is not live yet or has already ended." : ""}
                    className={`w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center transition-colors ${
                      isLive
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <Video className="w-4 h-4 mr-1" />
                    {isLive ? "Join Meeting" : "Not Live Yet"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CourseSessionsList;
