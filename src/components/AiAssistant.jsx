import React, { useState } from "react";
import { aiAPI } from "../services/api";

const AiAssistant = ({ onClose }) => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await aiAPI.ask(prompt); // Call your backend AI API
      setResponse(res.data.answer);
    } catch (err) {
      console.error("Failed to get AI response", err);
      setResponse("Failed to get AI response");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-4">
      {/* Left panel: input */}
      <div className="w-1/3 p-4 border rounded">
        <h2 className="font-bold mb-2">Ask AI</h2>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full h-32 border p-2 rounded mb-2"
        />
        <button
          onClick={handleAsk}
          className="px-4 py-2 bg-blue-600 text-white rounded"
          disabled={loading}
        >
          {loading ? "Loading..." : "Ask"}
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 ml-2 bg-gray-300 rounded"
        >
          Close
        </button>
      </div>

      {/* Right panel: response */}
      <div className="w-2/3 p-4 border rounded">
        <h2 className="font-bold mb-2">AI Response</h2>
        <div>{response || "AI response will appear here"}</div>
      </div>
    </div>
  );
};

export default AiAssistant;
