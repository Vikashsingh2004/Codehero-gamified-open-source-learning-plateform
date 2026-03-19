import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Code,
  RefreshCw,
} from "lucide-react";
import { submissionsAPI } from "../services/api";

const CURRENT_USER_ID = "1";

const SubmissionHistory = ({ userId = CURRENT_USER_ID }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
    const interval = setInterval(fetchSubmissions, 10000);
    return () => clearInterval(interval);
  }, [userId]);

  const fetchSubmissions = async () => {
    try {
      const response = await submissionsAPI.getUserSubmissions(userId);
      setSubmissions(response.data);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "wrong-answer":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "time-limit":
        return <Clock className="w-5 h-5 text-orange-500" />;
      case "runtime-error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Code className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "accepted":
        return "Accepted";
      case "wrong-answer":
        return "Wrong Answer";
      case "time-limit":
        return "Time Limit Exceeded";
      case "runtime-error":
        return "Runtime Error";
      case "pending":
        return "Pending";
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "bg-green-50";
      case "wrong-answer":
      case "runtime-error":
        return "bg-red-50";
      case "time-limit":
        return "bg-orange-50";
      default:
        return "bg-gray-50";
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading submissions...</div>;
  }

  if (submissions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <Code className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No submissions yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Submission History
        </h2>
        <button
          onClick={fetchSubmissions}
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
                Problem
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Contest
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Language
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Status
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                Runtime
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                Submitted
              </th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission) => (
              <tr
                key={submission._id}
                className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${getStatusColor(
                  submission.status
                )}`}
              >
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">
                    {submission.problemId?.title || "Unknown Problem"}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-gray-600 text-sm">
                    {submission.contestId?.title || "Unknown Contest"}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {submission.language.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(submission.status)}
                    <span className="text-sm font-medium text-gray-900">
                      {getStatusText(submission.status)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-600">
                  {submission.runtime || "—"}
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-600">
                  {new Date(submission.submittedAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { SubmissionHistory };
