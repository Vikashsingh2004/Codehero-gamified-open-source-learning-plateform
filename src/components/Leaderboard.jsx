import React, { useState, useEffect } from "react";
import { Trophy, RefreshCw } from "lucide-react";
import { contestsAPI } from "../services/api";

const Leaderboard = ({ contestId }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 5000);
    return () => clearInterval(interval);
  }, [contestId]);

  const fetchLeaderboard = async () => {
    try {
      const response = await contestsAPI.getLeaderboard(contestId);
      setLeaderboard(response.data);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading leaderboard...</div>;
  }

  if (leaderboard.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No submissions yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Leaderboard</h2>
        <button
          onClick={fetchLeaderboard}
          className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                User
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                Score
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                Problems Solved
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                Attempts
              </th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry) => (
              <tr
                key={entry.rank}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    {entry.rank <= 3 && (
                      <Trophy
                        className={`w-5 h-5 ${
                          entry.rank === 1
                            ? "text-yellow-500"
                            : entry.rank === 2
                            ? "text-gray-400"
                            : "text-orange-600"
                        }`}
                      />
                    )}
                    <span className="font-semibold text-gray-900">
                      {entry.rank}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      {entry.user?.name || "Anonymous"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {entry.user?.email || ""}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-lg font-bold text-gray-900">
                    {entry.score}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                    {entry.problemsSolved}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-gray-600">
                    {entry.totalSubmissions}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { Leaderboard };
