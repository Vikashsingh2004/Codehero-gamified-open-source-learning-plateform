import React, { useState, useEffect } from "react";
import {
  Trophy,
  Calendar,
  Clock,
  Users,
  Code,
  Award,
} from "lucide-react";
import { SubmissionHistory } from "./SubmissionHistory";
import { contestsAPI } from "../services/api";

const CURRENT_USER_ID = "1";

const Contests = () => {
  const [contests, setContests] = useState([]);
  const [selectedContest, setSelectedContest] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [loading, setLoading] = useState(true);

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

  const filteredContests = contests.filter((contest) => contest.status === activeTab);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "text-green-600 bg-green-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "hard":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming":
        return "text-blue-600 bg-blue-100";
      case "ongoing":
        return "text-green-600 bg-green-100";
      case "completed":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };


  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p>Loading contests...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Programming Contests
          </h1>
          <p className="text-gray-600 mt-2">
            Test your skills and compete with other developers
          </p>
        </div>
        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
          <div className="flex items-center">
            <Trophy className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">
              {contests.length} contests available
            </span>
          </div>
        </div>
      </div>

      <div className="flex space-x-1 mb-8">
        {["upcoming", "ongoing", "completed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
              activeTab === tab
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab} ({contests.filter((c) => c.status === tab).length})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {filteredContests.map((contest) => (
          <div
            key={contest._id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {contest.title}
                </h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    contest.status
                  )}`}
                >
                  {contest.status}
                </span>
              </div>

              <p className="text-gray-600 mb-4">{contest.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <div>
                    <p className="text-xs text-gray-500">Start Time</p>
                    <p className="font-medium">
                      {new Date(contest.startTime).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="font-medium">
                      {Math.round(
                        (new Date(contest.endTime) -
                          new Date(contest.startTime)) /
                          (1000 * 60 * 60)
                      )}
                      h
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  <div>
                    <p className="text-xs text-gray-500">Participants</p>
                    <p className="font-medium">{contest.participants.length}</p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Code className="w-4 h-4 mr-2" />
                  <div>
                    <p className="text-xs text-gray-500">Problems</p>
                    <p className="font-medium">
                      {contest.problems?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                    contest.difficulty
                  )}`}
                >
                  {contest.difficulty}
                </span>
                <a
                  href={`/contest/${contest._id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm inline-block"
                >
                  View Details
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredContests.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No {activeTab} contests</p>
          <p className="text-gray-400 text-sm mt-1">
            Check back later for new contests
          </p>
        </div>
      )}

      <div className="mt-12 pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Recent Submissions
        </h2>
        <SubmissionHistory userId={CURRENT_USER_ID} />
      </div>
    </div>
  );
};

export { Contests };
