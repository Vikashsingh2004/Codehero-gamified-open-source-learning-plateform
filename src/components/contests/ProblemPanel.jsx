import React from "react";
import { Tag, Clock, Cpu, Trophy } from "lucide-react";

const difficultyColors = {
  easy: "text-green-600 bg-green-50 border-green-200",
  medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
  hard: "text-red-600 bg-red-50 border-red-200",
};

const ProblemPanel = ({ problem }) => {
  if (!problem) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Select a problem to view details
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div>
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-900">{problem.title}</h2>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${difficultyColors[problem.difficulty] || difficultyColors.medium}`}>
            {problem.difficulty}
          </span>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5 text-yellow-500" /> {problem.points} pts</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {problem.timeLimit}s</span>
          <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5" /> {problem.memoryLimit}MB</span>
        </div>

        {problem.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {problem.tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
                <Tag className="w-3 h-3" /> {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <section>
        <h3 className="text-sm font-semibold text-gray-800 mb-2 uppercase tracking-wide">Problem Statement</h3>
        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{problem.description}</p>
      </section>

      {problem.inputFormat && (
        <section>
          <h3 className="text-sm font-semibold text-gray-800 mb-2 uppercase tracking-wide">Input Format</h3>
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{problem.inputFormat}</p>
        </section>
      )}

      {problem.outputFormat && (
        <section>
          <h3 className="text-sm font-semibold text-gray-800 mb-2 uppercase tracking-wide">Output Format</h3>
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{problem.outputFormat}</p>
        </section>
      )}

      {problem.constraints && (
        <section>
          <h3 className="text-sm font-semibold text-gray-800 mb-2 uppercase tracking-wide">Constraints</h3>
          <div className="bg-gray-50 rounded-lg p-3 font-mono text-xs text-gray-700 whitespace-pre-wrap border border-gray-200">
            {problem.constraints}
          </div>
        </section>
      )}

      {(problem.sampleInput || problem.sampleOutput) && (
        <section>
          <h3 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">Sample</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Input</p>
              <div className="bg-gray-900 text-gray-100 rounded-lg p-3 font-mono text-xs whitespace-pre-wrap min-h-16">
                {problem.sampleInput || "-"}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Output</p>
              <div className="bg-gray-900 text-gray-100 rounded-lg p-3 font-mono text-xs whitespace-pre-wrap min-h-16">
                {problem.sampleOutput || "-"}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProblemPanel;
