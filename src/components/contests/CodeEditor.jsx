import React, { useState } from "react";
import { Play, Send, ChevronDown, CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";
import { contestsAPI } from "../../services/api";

const LANGUAGES = [
  { id: "cpp", label: "C++" },
  { id: "java", label: "Java" },
  { id: "python", label: "Python" },
  { id: "javascript", label: "JavaScript" },
  { id: "c", label: "C" },
];

const STARTERS = {
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}`,
  java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}`,
  python: `# Your code here\nimport sys\ninput = sys.stdin.readline\n\ndef solve():\n    pass\n\nsolve()`,
  javascript: `process.stdin.resume();\nprocess.stdin.setEncoding('utf8');\n\nlet input = '';\nprocess.stdin.on('data', data => input += data);\nprocess.stdin.on('end', () => {\n    // Your code here\n});`,
  c: `#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}`,
};

const statusIcons = {
  accepted: <CheckCircle className="w-4 h-4 text-green-600" />,
  "wrong-answer": <XCircle className="w-4 h-4 text-red-500" />,
  "time-limit": <Clock className="w-4 h-4 text-yellow-500" />,
  "runtime-error": <AlertTriangle className="w-4 h-4 text-orange-500" />,
};

const statusColors = {
  accepted: "text-green-700 bg-green-50 border-green-200",
  "wrong-answer": "text-red-700 bg-red-50 border-red-200",
  "time-limit": "text-yellow-700 bg-yellow-50 border-yellow-200",
  "runtime-error": "text-orange-700 bg-orange-50 border-orange-200",
};

const CodeEditor = ({ contestId, problem, contestEnded, onSubmitSuccess }) => {
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(STARTERS["cpp"]);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResults, setRunResults] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeResultTab, setActiveResultTab] = useState("run");

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(STARTERS[lang] || "");
  };

  const handleRun = async () => {
    if (!code.trim()) return;
    setRunning(true);
    setRunResults(null);
    setActiveResultTab("run");
    try {
      const res = await contestsAPI.run(contestId, { problemId: problem._id, code, language });
      setRunResults(res.data.results || []);
    } catch (err) {
      setRunResults([{ error: err.response?.data?.message || "Execution failed" }]);
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim() || contestEnded) return;
    setSubmitting(true);
    setSubmitResult(null);
    setActiveResultTab("submit");
    try {
      const res = await contestsAPI.submit(contestId, { problemId: problem._id, code, language });
      setSubmitResult(res.data.submission);
      if (onSubmitSuccess) onSubmitSuccess(res.data.submission);
    } catch (err) {
      alert(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800 border-b border-gray-700">
        <div className="relative">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="appearance-none bg-gray-700 text-gray-100 text-sm px-3 py-1.5 pr-7 rounded-md cursor-pointer border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRun}
            disabled={running || submitting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-600 text-gray-100 rounded-md hover:bg-gray-500 text-sm transition-colors disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            {running ? "Running..." : "Run"}
          </button>
          {!contestEnded && (
            <button
              onClick={handleSubmit}
              disabled={running || submitting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? "Submitting..." : "Submit"}
            </button>
          )}
        </div>
      </div>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="flex-1 bg-gray-900 text-gray-100 font-mono text-sm p-4 resize-none outline-none leading-relaxed"
        spellCheck={false}
        style={{ minHeight: "300px" }}
        placeholder="Write your solution here..."
      />

      {(runResults !== null || submitResult !== null) && (
        <div className="border-t border-gray-700 bg-gray-850 max-h-64 overflow-y-auto">
          <div className="flex border-b border-gray-700 bg-gray-800">
            <button
              onClick={() => setActiveResultTab("run")}
              className={`px-4 py-2 text-xs font-medium ${activeResultTab === "run" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400"}`}
            >
              Run Output
            </button>
            <button
              onClick={() => setActiveResultTab("submit")}
              className={`px-4 py-2 text-xs font-medium ${activeResultTab === "submit" ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-400"}`}
            >
              Submission
            </button>
          </div>

          <div className="p-4">
            {activeResultTab === "run" && runResults && (
              <div className="space-y-3">
                {runResults.map((r, i) => (
                  <div key={i} className={`rounded-lg border p-3 ${r.passed ? "bg-green-900/30 border-green-700/50" : "bg-red-900/30 border-red-700/50"}`}>
                    {r.error ? (
                      <p className="text-red-400 text-xs">{r.error}</p>
                    ) : (
                      <div className="space-y-1.5 text-xs font-mono">
                        <div className="flex items-center gap-1.5 mb-2">
                          {r.passed ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <XCircle className="w-3.5 h-3.5 text-red-400" />}
                          <span className={r.passed ? "text-green-400" : "text-red-400"}>{r.passed ? "Passed" : "Failed"} - Test {i + 1}</span>
                        </div>
                        <div><span className="text-gray-400">Input: </span><span className="text-gray-200">{r.input}</span></div>
                        <div><span className="text-gray-400">Expected: </span><span className="text-gray-200">{r.expectedOutput}</span></div>
                        <div><span className="text-gray-400">Output: </span><span className="text-gray-200">{r.actualOutput}</span></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeResultTab === "submit" && submitResult && (
              <div className={`rounded-lg border p-4 ${statusColors[submitResult.status] || "bg-gray-800 border-gray-600 text-gray-300"}`}>
                <div className="flex items-center gap-2 mb-2">
                  {statusIcons[submitResult.status]}
                  <span className="font-semibold capitalize text-sm">{submitResult.status?.replace(/-/g, " ")}</span>
                </div>
                <div className="flex gap-4 text-xs">
                  <span>Score: <strong>{submitResult.score}</strong></span>
                  <span>Time: <strong>{submitResult.executionTime}ms</strong></span>
                </div>
                {submitResult.testResults && (
                  <div className="mt-3 space-y-1.5">
                    {submitResult.testResults.map((tr, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        {tr.passed ? <CheckCircle className="w-3 h-3 text-green-600" /> : <XCircle className="w-3 h-3 text-red-500" />}
                        <span>Test {i + 1}: {tr.isHidden ? "(hidden)" : tr.input?.slice(0, 30)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
