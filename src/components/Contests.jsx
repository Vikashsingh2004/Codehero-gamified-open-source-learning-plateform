import React, { useState, useEffect } from "react";
import { Trophy, Plus, Lock, Search } from "lucide-react";
import { contestsAPI } from "../services/api";
import ContestCard from "./contests/ContestCard";
import ContestArena from "./contests/ContestArena";
import CreateContestForm from "./contests/CreateContestForm";

const STATUS_TABS = ["all", "upcoming", "live", "ended"];

const Contests = ({ currentUser }) => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [activeContest, setActiveContest] = useState(null);
  const [joinLoading, setJoinLoading] = useState(null);
  const [search, setSearch] = useState("");

  const currentUserId = currentUser?._id?.toString() || currentUser?.id?.toString();

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const res = await contestsAPI.getAll();
      setContests(res.data);
    } catch (err) {
      console.error("Failed to fetch contests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (contestId) => {
    try {
      setJoinLoading(contestId);
      const res = await contestsAPI.join(contestId);
      setContests((prev) => prev.map((c) => (c._id === contestId ? res.data : c)));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to join contest");
    } finally {
      setJoinLoading(null);
    }
  };

  const handleEnter = async (contest) => {
    try {
      const res = await contestsAPI.getById(contest._id);
      setActiveContest(res.data);
    } catch {
      setActiveContest(contest);
    }
  };

  const handleContestCreated = (newContest) => {
    setContests((prev) => [newContest, ...prev]);
    setShowCreate(false);
  };

  const filteredContests = contests.filter((c) => {
    const matchesTab = activeTab === "all" || c.status === activeTab;
    const matchesSearch = !search || c.title?.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const countByStatus = (status) => contests.filter((c) => c.status === status).length;

  if (activeContest) {
    return (
      <ContestArena
        contest={activeContest}
        currentUser={currentUser}
        onBack={() => { setActiveContest(null); fetchContests(); }}
      />
    );
  }

  if (showCreate && currentUser?.role === "mentor") {
    return (
      <CreateContestForm
        onCancel={() => setShowCreate(false)}
        onCreated={handleContestCreated}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Programming Contests</h1>
          <p className="text-gray-600 mt-1.5">Compete, learn, and climb the leaderboard</p>
        </div>
        <div className="flex items-center gap-3">
          {currentUser?.role === "mentor" && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Contest
            </button>
          )}
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium">
            <Trophy className="w-4 h-4 text-blue-500" />
            {contests.length} contests
          </div>
        </div>
      </div>

      {currentUser?.role !== "mentor" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Want to create contests?</p>
            <p className="text-sm text-amber-600 mt-0.5">Become a Mentor to create and manage programming contests.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search contests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "all" ? `All (${contests.length})` : `${tab} (${countByStatus(tab)})`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-2/3 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-4/5" />
            </div>
          ))}
        </div>
      ) : filteredContests.length === 0 ? (
        <div className="text-center py-16">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No contests found</p>
          <p className="text-gray-400 text-sm mt-1">
            {search ? "Try a different search" : `No ${activeTab === "all" ? "" : activeTab} contests yet`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredContests.map((contest) => (
            <ContestCard
              key={contest._id}
              contest={contest}
              currentUserId={currentUserId}
              onJoin={handleJoin}
              onEnter={handleEnter}
              joinLoading={joinLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export { Contests };
