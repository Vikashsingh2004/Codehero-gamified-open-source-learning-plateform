import React, { useState, useEffect } from "react";
import { Calendar, Clock, Users, Code, Trophy, Zap, Timer } from "lucide-react";

const difficultyStyles = {
  beginner: "text-green-700 bg-green-100",
  intermediate: "text-yellow-700 bg-yellow-100",
  advanced: "text-red-700 bg-red-100",
};

const statusStyles = {
  upcoming: "text-blue-700 bg-blue-100",
  live: "text-green-700 bg-green-100 animate-pulse",
  ended: "text-gray-600 bg-gray-100",
};

function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const tick = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft(""); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return timeLeft;
}

const ContestCard = ({ contest, currentUserId, onJoin, onEnter, joinLoading }) => {
  const isRegistered = contest.participants?.some(
    (p) => (p.userId?._id || p.userId)?.toString() === currentUserId
  );
  const countdown = useCountdown(contest.status === "upcoming" ? contest.startTime : contest.endTime);
  const durationMs = new Date(contest.endTime) - new Date(contest.startTime);
  const durationH = Math.floor(durationMs / 3600000);
  const durationM = Math.floor((durationMs % 3600000) / 60000);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 leading-snug flex-1 mr-3">{contest.title}</h3>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusStyles[contest.status] || statusStyles.upcoming}`}>
            {contest.status === "live" ? "● LIVE" : contest.status}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-2">{contest.description}</p>

        {countdown && (
          <div className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-lg text-sm font-medium ${
            contest.status === "live" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"
          }`}>
            <Timer className="w-4 h-4" />
            {contest.status === "live" ? `Ends in: ${countdown}` : `Starts in: ${countdown}`}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Start</p>
              <p className="font-medium text-gray-700">
                {new Date(contest.startTime).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Duration</p>
              <p className="font-medium text-gray-700">
                {durationH > 0 ? `${durationH}h ` : ""}{durationM > 0 ? `${durationM}m` : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Participants</p>
              <p className="font-medium text-gray-700">{contest.participants?.length || 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Problems</p>
              <p className="font-medium text-gray-700">{contest.problems?.length || 0}</p>
            </div>
          </div>
        </div>

        {contest.totalMarks > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span>Total Marks: <strong className="text-gray-700">{contest.totalMarks}</strong></span>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${difficultyStyles[contest.difficulty] || difficultyStyles.intermediate}`}>
            {contest.difficulty}
          </span>

          <div className="flex gap-2 items-center">
            {contest.status === "ended" ? (
              isRegistered ? (
                <button
                  onClick={() => onEnter(contest)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
                >
                  View Results
                </button>
              ) : (
                <span className="px-3 py-2 text-gray-400 text-sm font-medium">
                  Contest Ended
                </span>
              )
            ) : isRegistered ? (
              <div className="flex gap-2 items-center">
                <span className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  Registered
                </span>
                {contest.status === "live" ? (
                  <button
                    onClick={() => onEnter(contest)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Enter
                  </button>
                ) : (
                  <span className="text-xs text-gray-400">Waiting for contest to go live</span>
                )}
              </div>
            ) : contest.status === "live" ? (
              <button
                onClick={() => onJoin(contest._id)}
                disabled={joinLoading === contest._id}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors disabled:opacity-60"
              >
                {joinLoading === contest._id ? "Joining..." : "Join & Enter"}
              </button>
            ) : (
              <button
                onClick={() => onJoin(contest._id)}
                disabled={joinLoading === contest._id || contest.status !== "upcoming"}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors disabled:opacity-60"
              >
                {joinLoading === contest._id ? "Joining..." : "Register"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestCard;
