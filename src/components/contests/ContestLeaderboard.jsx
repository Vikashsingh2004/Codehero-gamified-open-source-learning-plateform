import React, { useState, useEffect } from "react";
import { Trophy, RefreshCw, Medal } from "lucide-react";
import { contestsAPI } from "../../services/api";

const rankStyles = ["text-yellow-500", "text-gray-400", "text-amber-600"];

const ContestLeaderboard = ({ contestId }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await contestsAPI.getLeaderboard(contestId);
      setLeaderboard(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    const id = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(id);
  }, [contestId]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h3 className="text-base font-bold text-gray-900">Leaderboard</h3>
        </div>
        <button
          onClick={fetchLeaderboard}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="p-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="p-8 text-center text-gray-400 text-sm">No participants yet</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Rank</th>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-right">Score</th>
                <th className="px-4 py-3 text-right">Solved</th>
                <th className="px-4 py-3 text-right">Submissions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leaderboard.map((entry) => (
                <tr key={entry.userId?._id || entry.rank} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {entry.rank <= 3 ? (
                        <Medal className={`w-4 h-4 ${rankStyles[entry.rank - 1]}`} />
                      ) : (
                        <span className="text-sm text-gray-500 font-medium w-4 text-center">{entry.rank}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                        {entry.userId?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{entry.userId?.name || "Unknown"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-bold text-gray-900">{entry.score}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-green-600 font-medium">{entry.problemsSolved}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-gray-500">{entry.totalSubmissions}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ContestLeaderboard;
