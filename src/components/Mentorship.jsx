import React, { useState, useEffect } from "react";
import { Calendar, Clock, Users, Video, Plus, User, Lock } from "lucide-react";
import { sessionsAPI } from "../services/api";
import { VideoCall } from "./VideoCall";

export const Mentorship = ({ userRole, currentUser }) => {
  const [sessions, setSessions] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState("browse");
  const [activeVideoRoom, setActiveVideoRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const res = await sessionsAPI.getAll();
        setSessions(res.data);
      } catch (err) {
        setError("Could not load sessions.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const handleCreateSession = async (formData) => {
    try {
      const res = await sessionsAPI.create(formData);
      setSessions([res.data, ...sessions]);
      setShowCreateForm(false);
      setActiveTab("my-sessions");
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || "Failed to create session");
    }
  };

  const handleJoinSession = async (sessionId) => {
    try {
      const res = await sessionsAPI.join(sessionId);
      setSessions((prev) => prev.map((s) => (s.id === sessionId ? res.data : s)));
      setActiveTab("my-sessions");
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || "Failed to join session");
    }
  };

  const currentUserId = currentUser?._id?.toString() || currentUser?.id?.toString();

  const upcomingSessions = sessions.filter((s) => s.status === "upcoming");
  const mySessions = sessions.filter((s) =>
    userRole === "mentor"
      ? s.mentorId?.toString() === currentUserId
      : s.attendees?.includes(currentUserId)
  );

  if (activeVideoRoom) {
    const activeSession = sessions.find((s) => s.id === activeVideoRoom);
    return (
      <VideoCall
        sessionId={activeVideoRoom}
        isHost={userRole === "mentor" && activeSession?.mentorId?.toString() === currentUserId}
        onLeave={() => setActiveVideoRoom(null)}
      />
    );
  }

  if (showCreateForm && userRole === "mentor") {
    return <CreateSessionForm onSubmit={handleCreateSession} onCancel={() => setShowCreateForm(false)} />;
  }

  const displayedSessions = activeTab === "browse" ? upcomingSessions : mySessions;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mentorship Sessions</h1>
          <p className="text-gray-600 mt-2">
            {userRole === "mentor" ? "Host and manage your sessions" : "Join live sessions with mentors"}
          </p>
        </div>
        {userRole === "mentor" && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Host Session
          </button>
        )}
      </div>

      {userRole !== "mentor" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <Lock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">Want to host sessions?</p>
            <p className="text-sm text-blue-600 mt-0.5">
              Earn contribution points to get promoted to Mentor status and unlock session hosting.
            </p>
          </div>
        </div>
      )}

      <div className="flex space-x-2 mb-8">
        <button
          onClick={() => setActiveTab("browse")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "browse" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Browse ({upcomingSessions.length})
        </button>
        <button
          onClick={() => setActiveTab("my-sessions")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "my-sessions" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          My Sessions ({mySessions.length})
        </button>
      </div>

      {loading && <p className="text-gray-500 text-center py-8">Loading sessions...</p>}
      {error && <p className="text-red-500 text-center py-4">{error}</p>}

      {!loading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedSessions.map((s) => {
            const isAttending = s.attendees?.includes(currentUserId);
            const isMentorOwned = s.mentorId?.toString() === currentUserId;

            return (
              <div key={s.id || s._id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 text-lg leading-tight">{s.title}</h3>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full ml-2 flex-shrink-0">
                    {s.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{s.description}</p>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{s.mentorName}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{new Date(s.scheduledAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{s.duration} mins</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{s.attendees?.length || 0} / {s.capacity} attendees</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {activeTab === "browse" && !isAttending && !isMentorOwned && (
                    <button
                      onClick={() => handleJoinSession(s.id || s._id)}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                    >
                      Join Session
                    </button>
                  )}
                  {(isAttending || isMentorOwned) && (
                    <button
                      onClick={() => setActiveVideoRoom(s.id || s._id)}
                      className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <Video className="w-4 h-4 mr-1" />
                      Join Meeting
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {displayedSessions.length === 0 && (
            <div className="col-span-3 text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No sessions found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CreateSessionForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduledAt: "",
    duration: "60",
    capacity: "20",
    tags: "",
  });

  const submit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <form onSubmit={submit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-5">
        <h2 className="text-2xl font-bold text-gray-900">Host a Session</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Session Title *</label>
          <input
            placeholder="e.g. Advanced React Patterns Q&A"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            placeholder="What will you cover in this session?"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date & Time *</label>
          <input
            type="datetime-local"
            value={formData.scheduledAt}
            onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <input
            placeholder="react, javascript, node.js"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Session
          </button>
        </div>
      </form>
    </div>
  );
};
