import React, { useState } from "react";
import {
  Plus,
  Search,
  Clock,
  Award,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Zap,
} from "lucide-react";
import { doubtsAPI, aiAPI } from "../services/api";
import AiAssistant from "./AiAssistant";

const CURRENT_USER_ID = "1"; // Replace with real auth ID if available

export const Doubts = ({ doubts, setDoubts, updateUser }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDoubt, setSelectedDoubt] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredDoubts = doubts.filter((doubt) => {
    const matchesFilter = filter === "all" || doubt.status === filter;
    const matchesSearch =
      doubt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doubt.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesFilter && matchesSearch;
  });

  const handleCreateDoubt = async (formData) => {
    try {
      setLoading(true);
      const response = await doubtsAPI.create(formData);
      setDoubts([response.data, ...doubts]);
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error creating doubt:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const getStatusIcon = (status) => {
    switch (status) {
      case "open":
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case "solved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  // ================= Render UI =================
  if (showAI) {
    return <AiAssistant onClose={() => setShowAI(false)} />;
  }

  if (showCreateForm) {
    return (
      <CreateDoubtForm
        onSubmit={handleCreateDoubt}
        onCancel={() => setShowCreateForm(false)}
        loading={loading}
      />
    );
  }

  if (selectedDoubt) {
    return (
      <DoubtDetail
        doubt={selectedDoubt}
        onBack={() => setSelectedDoubt(null)}
        setDoubts={setDoubts}
        doubts={doubts}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community Doubts</h1>
          <p className="text-gray-600 mt-2">
            Help others learn and earn contribution points
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ask Question
          </button>

          <button
            onClick={() => setShowAI(true)}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Zap className="w-4 h-4 mr-2" />
            Ask AI
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search doubts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Doubts</option>
          <option value="open">Open</option>
          <option value="solved">Solved</option>
        </select>
      </div>

      {/* Doubts List */}
      <div className="space-y-4">
        {filteredDoubts.map((doubt) => (
          <div
            key={doubt._id}
            onClick={() => setSelectedDoubt(doubt)}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3 flex-1">
                {getStatusIcon(doubt.status)}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {doubt.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {doubt.description}
                  </p>
                </div>
              </div>
              {doubt.bounty > 0 && (
                <div className="flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                  <Award className="w-3 h-3 mr-1" />
                  {doubt.bounty} pts
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                    doubt.difficulty
                  )}`}
                >
                  {doubt.difficulty}
                </span>
                <div className="flex flex-wrap gap-1">
                  {doubt.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-500 space-x-4">
                <span>{doubt.solutions.length} solutions</span>
                <span>{new Date(doubt.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDoubts.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No doubts found</p>
          <p className="text-gray-400 text-sm mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
};

// ================= Create Doubt Form =================
const CreateDoubtForm = ({ onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: "",
    difficulty: "medium",
    bounty: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title && formData.description) {
      onSubmit(formData);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Ask a Question</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What's your programming question?"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Provide as much detail as possible..."
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="javascript, react, algorithms (comma-separated)"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({ ...formData, difficulty: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              disabled={loading}
            >
              {loading ? "Posting..." : "Post Question"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ================= Doubt Detail Component =================
const DoubtDetail = ({ doubt, onBack, setDoubts, doubts }) => {
  const [newSolution, setNewSolution] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddSolution = async () => {
    if (!newSolution.trim()) return;

    try {
      setLoading(true);
      const response = await doubtsAPI.addSolution(doubt._id, { content: newSolution });
      setDoubts(doubts.map((d) => (d._id === doubt._id ? response.data : d)));
      setNewSolution("");
    } catch (error) {
      console.error("Error adding solution:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={onBack}
        className="mb-6 text-blue-600 hover:text-blue-700 transition-colors"
      >
        ← Back to Doubts
      </button>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{doubt.title}</h1>
          {doubt.bounty > 0 && (
            <div className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
              <Award className="w-4 h-4 mr-1" />
              {doubt.bounty} points
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4 mb-4">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              doubt.difficulty === "easy"
                ? "text-green-600 bg-green-100"
                : doubt.difficulty === "medium"
                ? "text-yellow-600 bg-yellow-100"
                : "text-red-600 bg-red-100"
            }`}
          >
            {doubt.difficulty}
          </span>
          <div className="flex flex-wrap gap-1">
            {doubt.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
          <span className="text-sm text-gray-500">
            {new Date(doubt.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{doubt.description}</p>
        </div>
      </div>

      {/* Solutions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Solutions ({doubt.solutions.length})
        </h2>

        {doubt.solutions.map((solution) => (
          <div
            key={solution._id}
            className="border-b border-gray-200 pb-6 mb-6 last:border-b-0 last:mb-0"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                {solution.isAccepted && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                <span className="text-sm text-gray-600">
                  {new Date(solution.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{solution.upvotes} upvotes</span>
              </div>
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{solution.content}</p>
            </div>
          </div>
        ))}

        {doubt.status === "open" && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Your Solution</h3>
            <textarea
              value={newSolution}
              onChange={(e) => setNewSolution(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Share your solution..."
              disabled={loading}
            />
            <button
              onClick={handleAddSolution}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              disabled={!newSolution.trim() || loading}
            >
              {loading ? "Submitting..." : "Submit Solution"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
