import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Timer, CheckCircle, Circle, Trophy, List } from "lucide-react";
import CodeEditor from "./CodeEditor";
import ProblemPanel from "./ProblemPanel";
import ContestLeaderboard from "./ContestLeaderboard";
import { contestsAPI } from "../../services/api";

function useContestTimer(endTime) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    const tick = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("00:00:00"); setIsEnded(true); return; }
      const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
      setTimeLeft(`${h}:${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  return { timeLeft, isEnded };
}

const difficultyColors = {
  easy: "text-green-600",
  medium: "text-yellow-600",
  hard: "text-red-600",
};

const ContestArena = ({ contest: initialContest, currentUser, onBack }) => {
  const [contest, setContest] = useState(initialContest);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [activeView, setActiveView] = useState("arena");
  const [mySubmissions, setMySubmissions] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState(new Set());
  const { timeLeft, isEnded } = useContestTimer(contest.endTime);

  const isEnded_ = isEnded || contest.status === "ended";

  const fetchMySubmissions = useCallback(async () => {
    try {
      const res = await contestsAPI.getMySubmissions(contest._id);
      setMySubmissions(res.data);
      const solved = new Set(
        res.data.filter((s) => s.status === "accepted").map((s) => s.problemId?._id || s.problemId)
      );
      setSolvedProblems(solved);
    } catch (err) {
      console.error(err);
    }
  }, [contest._id]);

  useEffect(() => {
    const loadContest = async () => {
      try {
        const res = await contestsAPI.getById(contest._id);
        const fresh = res.data;
        setContest(fresh);
        if (fresh.problems?.length > 0) {
          setSelectedProblem(fresh.problems[0]);
        }
      } catch {
        if (contest.problems?.length > 0) {
          setSelectedProblem(contest.problems[0]);
        }
      }
    };
    contestsAPI.enter(contest._id).catch(() => {});
    fetchMySubmissions();
    loadContest();
  }, []);

  const handleSubmitSuccess = () => {
    fetchMySubmissions();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Exit
          </button>
          <div className="w-px h-5 bg-gray-200" />
          <h1 className="text-base font-bold text-gray-900">{contest.title}</h1>
          {isEnded_ && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">Ended</span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-mono font-semibold ${
            isEnded_ ? "bg-gray-100 text-gray-500" : "bg-red-50 text-red-700"
          }`}>
            <Timer className="w-4 h-4" />
            {isEnded_ ? "Contest Ended" : timeLeft}
          </div>

          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setActiveView("arena")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                activeView === "arena" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Arena
            </button>
            <button
              onClick={() => setActiveView("leaderboard")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                activeView === "leaderboard" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              Leaderboard
            </button>
          </div>
        </div>
      </div>

      {activeView === "leaderboard" ? (
        <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">
          <ContestLeaderboard contestId={contest._id} />
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <div className="w-48 bg-white border-r border-gray-200 flex flex-col">
            <div className="px-3 py-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Problems</p>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              {contest.problems?.length === 0 && (
                <p className="text-xs text-gray-400 px-3 py-2">No problems yet</p>
              )}
              {contest.problems?.map((problem, idx) => {
                const pid = problem._id || problem;
                const isSolved = solvedProblems.has(pid?.toString());
                const isSelected = selectedProblem?._id === pid || selectedProblem === pid;
                return (
                  <button
                    key={pid}
                    onClick={() => setSelectedProblem(problem)}
                    className={`w-full text-left px-3 py-2.5 flex items-center gap-2.5 transition-colors ${
                      isSelected ? "bg-blue-50 border-r-2 border-blue-600" : "hover:bg-gray-50"
                    }`}
                  >
                    {isSolved ? (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    )}
                    <div>
                      <p className={`text-xs font-semibold ${isSelected ? "text-blue-700" : "text-gray-700"}`}>
                        {String.fromCharCode(65 + idx)}
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-24">{problem.title}</p>
                      {problem.difficulty && (
                        <p className={`text-xs capitalize font-medium ${difficultyColors[problem.difficulty]}`}>
                          {problem.difficulty}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {mySubmissions.length > 0 && (
              <div className="border-t border-gray-100 px-3 py-3">
                <p className="text-xs font-semibold text-gray-500 mb-2">Recent</p>
                <div className="space-y-1">
                  {mySubmissions.slice(0, 3).map((sub) => (
                    <div key={sub._id} className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        sub.status === "accepted" ? "bg-green-500" : "bg-red-400"
                      }`} />
                      <span className="text-xs text-gray-500 truncate">{sub.problemId?.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className="w-1/2 bg-white border-r border-gray-200 overflow-hidden">
              <ProblemPanel problem={selectedProblem} />
            </div>
            <div className="w-1/2 overflow-hidden">
              {selectedProblem ? (
                <CodeEditor
                  contestId={contest._id}
                  problem={selectedProblem}
                  contestEnded={isEnded_}
                  onSubmitSuccess={handleSubmitSuccess}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-900 text-gray-500 text-sm">
                  Select a problem to start coding
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContestArena;
