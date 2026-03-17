import express from "express";
import axios from "axios"; // if using OpenAI or other AI API

const router = express.Router();

router.post("/", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "No prompt provided" });

  try {
    // Example using OpenAI API (make sure to set OPENAI_API_KEY in env)
    const response = await axios.post(
      "https://api.openai.com/v1/completions",
      {
        model: "text-davinci-003",
        prompt,
        max_tokens: 300,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const answer = response.data.choices[0].text.trim();
    res.json({ answer });
  } catch (err) {
    console.error("AI error:", err);
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

export default router;
