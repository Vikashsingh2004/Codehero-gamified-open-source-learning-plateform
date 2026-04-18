import React, { useState } from "react";
import { ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { contestsAPI } from "../../services/api";

const defaultProblem = {
  title: "",
  description: "",
  difficulty: "medium",
  points: 100,
  inputFormat: "",
  outputFormat: "",
  constraints: "",
  sampleInput: "",
  sampleOutput: "",
  tags: "",
  timeLimit: 2,
  memoryLimit: 256,
  testCases: [],
};

const ProblemForm = ({ problem, idx, onChange, onRemove }) => {
  const [expanded, setExpanded] = useState(idx === 0);
  const [tcInput, setTcInput] = useState("");
  const [tcOutput, setTcOutput] = useState("");
  const [tcHidden, setTcHidden] = useState(false);

  const addTestCase = () => {
    if (!tcInput.trim() || !tcOutput.trim()) return;
    onChange({ ...problem, testCases: [...problem.testCases, { input: tcInput, expectedOutput: tcOutput, isHidden: tcHidden }] });
    setTcInput("");
    setTcOutput("");
    setTcHidden(false);
  };

  const removeTestCase = (i) => {
    onChange({ ...problem, testCases: problem.testCases.filter((_, ti) => ti !== i) });
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
            {String.fromCharCode(65 + idx)}
          </span>
          <span className="font-medium text-gray-800 text-sm">{problem.title || `Problem ${idx + 1}`}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
            problem.difficulty === "easy" ? "bg-green-100 text-green-700" :
            problem.difficulty === "hard" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
          }`}>{problem.difficulty}</span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(); }} className="text-red-400 hover:text-red-600 p-1">
            <Trash2 className="w-4 h-4" />
          </button>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </div>
      </button>

      {expanded && (
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
              <input type="text" value={problem.title} onChange={(e) => onChange({ ...problem, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Difficulty</label>
                <select value={problem.difficulty} onChange={(e) => onChange({ ...problem, difficulty: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Points</label>
                <input type="number" value={problem.points} onChange={(e) => onChange({ ...problem, points: +e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" min="1" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Time (s)</label>
                <input type="number" value={problem.timeLimit} onChange={(e) => onChange({ ...problem, timeLimit: +e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" min="1" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Problem Statement *</label>
            <textarea value={problem.description} onChange={(e) => onChange({ ...problem, description: e.target.value })} rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Input Format</label>
              <textarea value={problem.inputFormat} onChange={(e) => onChange({ ...problem, inputFormat: e.target.value })} rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Output Format</label>
              <textarea value={problem.outputFormat} onChange={(e) => onChange({ ...problem, outputFormat: e.target.value })} rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sample Input</label>
              <textarea value={problem.sampleInput} onChange={(e) => onChange({ ...problem, sampleInput: e.target.value })} rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sample Output</label>
              <textarea value={problem.sampleOutput} onChange={(e) => onChange({ ...problem, sampleOutput: e.target.value })} rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Constraints</label>
              <textarea value={problem.constraints} onChange={(e) => onChange({ ...problem, constraints: e.target.value })} rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tags (comma separated)</label>
              <input type="text" value={problem.tags} onChange={(e) => onChange({ ...problem, tags: e.target.value })}
                placeholder="arrays, dp, greedy..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Test Cases</label>
            <div className="space-y-2 mb-3">
              {problem.testCases.map((tc, i) => (
                <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${tc.isHidden ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>
                    {tc.isHidden ? "Hidden" : "Visible"}
                  </span>
                  <span className="text-xs text-gray-600 font-mono truncate flex-1">in: {tc.input}</span>
                  <span className="text-xs text-gray-600 font-mono truncate flex-1">out: {tc.expectedOutput}</span>
                  <button type="button" onClick={() => removeTestCase(i)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="border border-dashed border-gray-300 rounded-lg p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <textarea value={tcInput} onChange={(e) => setTcInput(e.target.value)} rows={2}
                  placeholder="Input..." className="border border-gray-300 rounded px-2 py-1.5 text-xs font-mono resize-none focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <textarea value={tcOutput} onChange={(e) => setTcOutput(e.target.value)} rows={2}
                  placeholder="Expected output..." className="border border-gray-300 rounded px-2 py-1.5 text-xs font-mono resize-none focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-gray-600">
                  <input type="checkbox" checked={tcHidden} onChange={(e) => setTcHidden(e.target.checked)} className="w-3.5 h-3.5" />
                  Hidden test case
                </label>
                <button type="button" onClick={addTestCase}
                  className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors">
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CreateContestForm = ({ onCancel, onCreated }) => {
  const [step, setStep] = useState(1);
  const [creating, setCreating] = useState(false);
  const [contest, setContest] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    difficulty: "intermediate",
    totalMarks: 0,
  });
  const [problems, setProblems] = useState([{ ...defaultProblem }]);
  const [savingProblems, setSavingProblems] = useState(false);

  const handleCreateContest = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.startTime || !formData.endTime) return;
    setCreating(true);
    try {
      const res = await contestsAPI.create(formData);
      setContest(res.data);
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create contest");
    } finally {
      setCreating(false);
    }
  };

  const handleSaveProblems = async () => {
    if (!contest) return;
    setSavingProblems(true);
    try {
      let updatedContest = contest;
      for (const problem of problems) {
        if (!problem.title || !problem.description) continue;
        const problemData = {
          ...problem,
          tags: typeof problem.tags === "string"
            ? problem.tags.split(",").map((t) => t.trim()).filter(Boolean)
            : problem.tags,
        };
        const res = await contestsAPI.addProblem(contest._id, problemData);
        updatedContest = res.data;
      }
      onCreated(updatedContest);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save problems");
    } finally {
      setSavingProblems(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={onCancel} className="flex items-center text-blue-600 mb-6 hover:text-blue-700 transition-colors text-sm">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Contests
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>1</div>
        <span className={`text-sm font-medium ${step >= 1 ? "text-blue-600" : "text-gray-400"}`}>Contest Details</span>
        <div className={`h-0.5 w-8 ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`} />
        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>2</div>
        <span className={`text-sm font-medium ${step >= 2 ? "text-blue-600" : "text-gray-400"}`}>Add Problems</span>
      </div>

      {step === 1 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Contest Details</h2>
          <form onSubmit={handleCreateContest} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. Weekly Algorithm Challenge" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the contest..." required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                <input type="datetime-local" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                <input type="datetime-local" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
              <select value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onCancel} className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                Cancel
              </button>
              <button type="submit" disabled={creating}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-60">
                {creating ? "Creating..." : "Next: Add Problems"}
              </button>
            </div>
          </form>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">✓</span>
            </div>
            <div>
              <p className="font-semibold text-green-800 text-sm">{contest?.title} created!</p>
              <p className="text-green-600 text-xs">Now add problems to your contest</p>
            </div>
          </div>

          <div className="space-y-3">
            {problems.map((problem, idx) => (
              <ProblemForm key={idx} problem={problem} idx={idx}
                onChange={(updated) => setProblems(problems.map((p, i) => (i === idx ? updated : p)))}
                onRemove={() => setProblems(problems.filter((_, i) => i !== idx))} />
            ))}
          </div>

          <button type="button" onClick={() => setProblems([...problems, { ...defaultProblem }])}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 text-gray-500 rounded-xl hover:border-blue-400 hover:text-blue-600 transition-colors text-sm">
            <Plus className="w-4 h-4" />
            Add Problem
          </button>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => onCreated(contest)}
              className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
              Skip & Finish
            </button>
            <button type="button" onClick={handleSaveProblems} disabled={savingProblems}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-60">
              {savingProblems ? "Saving..." : "Save & Publish"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateContestForm;
