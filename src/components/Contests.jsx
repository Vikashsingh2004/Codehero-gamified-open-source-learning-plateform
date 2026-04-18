import React, { useState, useEffect } from "react";
import { Trophy, Calendar, Clock, Users, Code, Plus, Lock } from "lucide-react";
import { SubmissionHistory } from "./SubmissionHistory";
import { contestsAPI } from "../services/api";

const Contests = ({ currentUser }) => {
  const [contests, setContests] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [joinLoading, setJoinLoading] = useState(null);

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const response = await contestsAPI.getAll();
      setContests(response.data);
    } catch (error) {
      console.error("Error fetching contests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinContest = async (contestId) => {
    try {
      setJoinLoading(contestId);
      const response = await contestsAPI.join(contestId);
      setContests((prev) => prev.map((c) => (c._id === contestId ? response.data : c)));
    } catch (error) {
      alert(error.response?.data?.message || "Failed to join contest");
    } finally {
      setJoinLoading(null);
    }
  };

  const handleCreateContest = async (formData) => {
    try {
      const response = await contestsAPI.create(formData);
      setContests([response.data, ...contests]);
      setShowCreateForm(false);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create contest");
    }
  };

  const filteredContests = contests.filter((contest) => contest.status === activeTab);
  const currentUserId = currentUser?._id?.toString() || currentUser?.id?.toString();

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "beginner": return "text-green-600 bg-green-100";
      case "intermediate": return "text-yellow-600 bg-yellow-100";
      case "advanced": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming": return "text-blue-600 bg-blue-100";
      case "ongoing": return "text-green-600 bg-green-100";
      case "completed": return "text-gray-600 bg-gray-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  if (showCreateForm && currentUser?.role === "mentor") {
    return <CreateContestForm onSubmit={handleCreateContest} onCancel={() => setShowCreateForm(false)} />;
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-gray-500">Loading contests...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Programming Contests</h1>
          <p className="text-gray-600 mt-2">Test your skills and compete with other developers</p>
        </div>
        <div className="flex items-center gap-3">
          {currentUser?.role === "mentor" && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Contest
            </button>
          )}
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg flex items-center">
            <Trophy className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">{contests.length} contests</span>
          </div>
        </div>
      </div>

      {currentUser?.role !== "mentor" && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Want to create contests?</p>
            <p className="text-sm text-amber-600 mt-0.5">Become a Mentor to create and manage programming contests.</p>
          </div>
        </div>
      )}

      <div className="flex space-x-1 mb-8">
        {["upcoming", "ongoing", "completed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
              activeTab === tab ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab} ({contests.filter((c) => c.status === tab).length})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {filteredContests.map((contest) => {
          const isRegistered = contest.participants?.some(
            (p) => p.userId?._id?.toString() === currentUserId || p.userId?.toString() === currentUserId
          );

          return (
            <div
              key={contest._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{contest.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contest.status)}`}>
                    {contest.status}
                  </span>
                </div>

                <p className="text-gray-600 mb-4">{contest.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Start Time</p>
                      <p className="font-medium">{new Date(contest.startTime).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="font-medium">
                        {Math.round((new Date(contest.endTime) - new Date(contest.startTime)) / (1000 * 60 * 60))}h
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Participants</p>
                      <p className="font-medium">{contest.participants?.length || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Code className="w-4 h-4 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Problems</p>
                      <p className="font-medium">{contest.problems?.length || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(contest.difficulty)}`}>
                    {contest.difficulty}
                  </span>
                  {contest.status !== "completed" && (
                    isRegistered ? (
                      <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                        Registered
                      </span>
                    ) : (
                      <button
                        onClick={() => handleJoinContest(contest._id)}
                        disabled={joinLoading === contest._id}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-60"
                      >
                        {joinLoading === contest._id ? "Joining..." : "Register"}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredContests.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No {activeTab} contests</p>
          <p className="text-gray-400 text-sm mt-1">Check back later for new contests</p>
        </div>
      )}

      <div className="mt-12 pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Submissions</h2>
        <SubmissionHistory userId={currentUserId} />
      </div>
    </div>
  );
};

const CreateContestForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    difficulty: "intermediate",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-5">
        <h2 className="text-2xl font-bold text-gray-900">Create Contest</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contest Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g. Weekly Algorithm Challenge"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Describe the contest..."
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
            <input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
            <input
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
          <select
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onCancel} className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            Cancel
          </button>
          <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Create Contest
          </button>
        </div>
      </form>
    </div>
  );
};

export { Contests };
