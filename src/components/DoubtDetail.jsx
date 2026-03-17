import React, { useState } from "react";
import { CheckCircle, TrendingUp, AlertCircle } from "lucide-react";
import { doubtsAPI, aiAPI } from "../services/api";

const DoubtDetail = ({ doubt, onBack, setDoubts, doubts }) => {
  const [newSolution, setNewSolution] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const handleAddSolution = async () => {
    if (!newSolution.trim()) return;
    try {
      setLoading(true);
      const response = await doubtsAPI.addSolution(doubt._id, { content: newSolution });
      setDoubts(doubts.map((d) => (d._id === doubt._id ? response.data : d)));
      setNewSolution("");
    } catch (err) {
      console.error("Error adding solution:", err);
      alert("Failed to add solution");
    } finally {
      setLoading(false);
    }
  };

  const handleAskAI = async () => {
    try {
      setAiLoading(true);
      const response = await aiAPI.ask(doubt.title + "\n" + doubt.description);
      setNewSolution(response.data.answer || "AI could not generate a response");
    } catch (err) {
      console.error("AI error:", err);
      alert("Failed to get AI response");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={onBack} className="mb-6 text-blue-600 hover:text-blue-700">
        ← Back to Doubts
      </button>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{doubt.title}</h1>
        <p className="text-gray-700 whitespace-pre-wrap mb-4">{doubt.description}</p>
        <div className="flex items-center space-x-2 mb-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            doubt.difficulty === "easy" ? "text-green-600 bg-green-100" :
            doubt.difficulty === "medium" ? "text-yellow-600 bg-yellow-100" :
            "text-red-600 bg-red-100"
          }`}>
            {doubt.difficulty}
          </span>
          {doubt.tags.map(tag => (
            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">{tag}</span>
          ))}
        </div>
      </div>

      {/* Solutions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Solutions ({doubt.solutions.length})
        </h2>

        {doubt.solutions.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No solutions yet. Be the first to help!
          </p>
        )}

        {doubt.solutions.map(solution => (
          <div key={solution._id} className="border-b border-gray-200 pb-6 mb-6 last:border-b-0 last:mb-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                {solution.isAccepted && <CheckCircle className="w-5 h-5 text-green-500" />}
                <span className="text-sm text-gray-600">{new Date(solution.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{solution.upvotes} upvotes</span>
              </div>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap">{solution.content}</p>
          </div>
        ))}

        {/* Add Solution */}
        {doubt.status === "open" && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Your Solution</h3>
            <textarea
              value={newSolution}
              onChange={e => setNewSolution(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Share your solution..."
              disabled={loading || aiLoading}
            />
            <div className="flex space-x-4 mt-4">
              <button
                onClick={handleAddSolution}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                disabled={!newSolution.trim() || loading || aiLoading}
              >
                {loading ? "Submitting..." : "Submit Solution"}
              </button>
              <button
                onClick={handleAskAI}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400"
                disabled={loading || aiLoading}
              >
                {aiLoading ? "Thinking..." : "Ask AI"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { DoubtDetail };
