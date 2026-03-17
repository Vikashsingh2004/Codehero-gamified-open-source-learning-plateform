import React, { useState, useEffect } from "react";
import { Calendar, Clock, Users, Video, Plus, User } from "lucide-react";
import { VideoCall } from "./VideoCall";

const CURRENT_USER_ID = "1"; // Replace with real auth

export const Mentorship = ({ userRole }) => {
  const [sessions, setSessions] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState("browse");
  const [activeVideoRoom, setActiveVideoRoom] = useState(null);

  // Fetch sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/sessions");
        if (!res.ok) throw new Error("Failed to load sessions");
        const data = await res.json();
        setSessions(data);
      } catch (err) {
        console.error(err);
        alert("Could not load sessions. Check server.");
      }
    };
    fetchSessions();
  }, []);

  // Create session
  const handleCreateSession = async (formData) => {
    try {
      const res = await fetch("http://localhost:5000/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          mentorId: CURRENT_USER_ID,
          mentorName: "Vikash Singh",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create session");
      setSessions([data, ...sessions]);
      setShowCreateForm(false);
      setActiveTab("my-sessions");
    } catch (err) {
      alert(err.message);
    }
  };

  // Join session
  const handleJoinSession = async (sessionId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/sessions/join/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: CURRENT_USER_ID }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to join session");
      setSessions((prev) => prev.map((s) => (s.id === sessionId ? data : s)));
      setActiveTab("my-sessions");
    } catch (err) {
      alert(err.message);
    }
  };

  const upcomingSessions = sessions.filter((s) => s.status === "upcoming");
  const mySessions = sessions.filter((s) =>
    userRole === "mentor" ? s.mentorId === CURRENT_USER_ID : s.attendees.includes(CURRENT_USER_ID)
  );

  if (activeVideoRoom) {
    const activeSession = sessions.find((s) => s.id === activeVideoRoom);
    return (
      <VideoCall
        sessionId={activeVideoRoom}
        isHost={userRole === "mentor" && activeSession?.mentorId === CURRENT_USER_ID}
        onLeave={() => setActiveVideoRoom(null)}
      />
    );
  }

  if (showCreateForm) return <CreateSessionForm onSubmit={handleCreateSession} onCancel={() => setShowCreateForm(false)} />;

  const displayedSessions = activeTab === "browse" ? upcomingSessions : mySessions;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Mentorship Sessions</h1>
          <p className="text-gray-600 mt-2">{userRole === "mentor" ? "Host sessions" : "Join sessions"}</p>
        </div>
        {userRole === "mentor" && (
          <button onClick={() => setShowCreateForm(true)} className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg">
            <Plus className="w-4 h-4 mr-2" /> Host Session
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-8">
        <button onClick={() => setActiveTab("browse")} className={`px-4 py-2 rounded-lg ${activeTab === "browse" ? "bg-blue-100 text-blue-700" : "text-gray-600"}`}>Browse</button>
        <button onClick={() => setActiveTab("my-sessions")} className={`px-4 py-2 rounded-lg ${activeTab === "my-sessions" ? "bg-blue-100 text-blue-700" : "text-gray-600"}`}>My Sessions ({mySessions.length})</button>
      </div>

      {/* Sessions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedSessions.map((s) => (
          <div key={s.id} className="bg-white border rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-lg">{s.title}</h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{s.status}</span>
            <p className="text-sm text-gray-600">{s.description}</p>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center"><User className="w-4 h-4 mr-2" /> {s.mentorName}</div>
              <div className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> {new Date(s.scheduledAt).toLocaleString()}</div>
              <div className="flex items-center"><Clock className="w-4 h-4 mr-2" /> {s.duration} mins</div>
              <div className="flex items-center"><Users className="w-4 h-4 mr-2" /> {s.attendees.length}/{s.capacity}</div>
            </div>
            <div className="flex gap-2 mt-2">
              {activeTab === "browse" && !s.attendees.includes(CURRENT_USER_ID) && (
                <button onClick={() => handleJoinSession(s.id)} className="flex-1 bg-blue-600 text-white py-2 rounded">Join Session</button>
              )}
              {s.attendees.includes(CURRENT_USER_ID) && (
                <button onClick={() => setActiveVideoRoom(s.id)} className="flex-1 bg-green-600 text-white py-2 rounded flex items-center justify-center"><Video className="w-4 h-4 mr-1" /> Join Meeting</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CreateSessionForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({ title: "", description: "", scheduledAt: "", duration: "60", capacity: "20", tags: "" });

  const submit = (e) => { e.preventDefault(); onSubmit(formData); };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <form onSubmit={submit} className="bg-white p-8 rounded shadow space-y-4">
        <h2 className="text-2xl font-bold">Host a Session</h2>
        <input placeholder="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full border p-2 rounded" required />
        <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full border p-2 rounded" required />
        <input type="datetime-local" value={formData.scheduledAt} onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })} className="w-full border p-2 rounded" required />
        <div className="grid grid-cols-2 gap-4">
          <input type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} className="border p-2 rounded" />
          <input type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} className="border p-2 rounded" />
        </div>
        <input placeholder="Tags" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} className="w-full border p-2 rounded" />
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
        </div>
      </form>
    </div>
  );
};
