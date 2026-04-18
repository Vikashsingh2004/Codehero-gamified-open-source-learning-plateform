import express from "express";
import Contest from "../models/Contest.js";
import Problem from "../models/Problem.js";
import Submission from "../models/Submission.js";
import User from "../models/User.js";
import Activity from "../models/Activity.js";
import { authMiddleware, mentorOnlyMiddleware } from "../middleware/auth.js";

const router = express.Router();

function syncStatus(contest) {
  const now = new Date();
  if (now < contest.startTime) contest.status = "upcoming";
  else if (now >= contest.startTime && now <= contest.endTime) contest.status = "live";
  else contest.status = "ended";
}

router.get("/", authMiddleware, async (req, res) => {
  try {
    const contests = await Contest.find()
      .populate("participants.userId", "name email avatar")
      .populate("problems", "title difficulty points tags timeLimit memoryLimit")
      .populate("createdBy", "name")
      .sort({ startTime: -1 });

    for (const contest of contests) {
      const prev = contest.status;
      syncStatus(contest);
      if (prev !== contest.status) await contest.save();
    }

    res.json(contests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id)
      .populate("participants.userId", "name email avatar")
      .populate("problems")
      .populate("createdBy", "name");
    if (!contest) return res.status(404).json({ message: "Contest not found" });
    syncStatus(contest);
    await contest.save();
    res.json(contest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", authMiddleware, mentorOnlyMiddleware, async (req, res) => {
  try {
    const { title, description, startTime, endTime, difficulty, totalMarks } = req.body;
    if (!title || !description || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const contest = new Contest({
      title, description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      difficulty: difficulty || "intermediate",
      totalMarks: totalMarks || 0,
      participants: [],
      problems: [],
      createdBy: req.user._id,
    });

    syncStatus(contest);
    await contest.save();
    await contest.populate("createdBy", "name");

    await Activity.create({
      userId: req.user._id,
      type: "contest_participated",
      description: `Created contest: ${title}`,
      points: 50,
      relatedId: contest._id,
    });

    res.status(201).json(contest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/:id/problems", authMiddleware, mentorOnlyMiddleware, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ message: "Contest not found" });

    const {
      title, description, difficulty, points,
      inputFormat, outputFormat, constraints,
      sampleInput, sampleOutput, tags,
      timeLimit, memoryLimit, testCases,
    } = req.body;

    if (!title || !description || !difficulty) {
      return res.status(400).json({ message: "Problem title, description, and difficulty are required" });
    }

    const problem = new Problem({
      title, description,
      difficulty: difficulty || "medium",
      points: points || 100,
      inputFormat: inputFormat || "",
      outputFormat: outputFormat || "",
      constraints: constraints || "",
      sampleInput: sampleInput || "",
      sampleOutput: sampleOutput || "",
      tags: tags || [],
      timeLimit: timeLimit || 2,
      memoryLimit: memoryLimit || 256,
      testCases: testCases || [],
      createdBy: req.user._id,
    });

    await problem.save();
    contest.problems.push(problem._id);
    contest.totalMarks = (contest.totalMarks || 0) + (points || 100);
    await contest.save();
    await contest.populate("problems");
    res.status(201).json(contest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id/problems/:problemId", authMiddleware, mentorOnlyMiddleware, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ message: "Contest not found" });
    contest.problems = contest.problems.filter((pid) => pid.toString() !== req.params.problemId);
    await contest.save();
    await contest.populate("problems");
    res.json(contest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/:id/join", authMiddleware, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id)
      .populate("participants.userId", "name email avatar")
      .populate("problems", "title difficulty points tags timeLimit memoryLimit");
    if (!contest) return res.status(404).json({ message: "Contest not found" });
    syncStatus(contest);

    const alreadyJoined = contest.participants.some(
      (p) => (p.userId._id || p.userId).toString() === req.user._id.toString()
    );

    if (!alreadyJoined) {
      contest.participants.push({ userId: req.user._id, score: 0, submissions: [] });
      await contest.save();
      await contest.populate("participants.userId", "name email avatar");

      await Activity.create({
        userId: req.user._id,
        type: "contest_participated",
        description: `Registered for contest: ${contest.title}`,
        points: 10,
        relatedId: contest._id,
      });

      await User.findByIdAndUpdate(req.user._id, {
        $inc: { experience: 10, contributionPoints: 10 },
      });
    }

    res.json(contest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/:id/submit", authMiddleware, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id).populate("problems");
    if (!contest) return res.status(404).json({ message: "Contest not found" });
    syncStatus(contest);
    if (contest.status !== "live") {
      return res.status(403).json({ message: "Contest is not live. Submissions are closed." });
    }

    const { problemId, code, language } = req.body;
    if (!problemId || !code || !language) {
      return res.status(400).json({ message: "problemId, code, and language are required" });
    }

    const problem = contest.problems.find((p) => p._id.toString() === problemId);
    if (!problem) return res.status(404).json({ message: "Problem not found in this contest" });

    const allTests = problem.testCases || [];
    const testResults = allTests.map((tc) => ({
      input: tc.isHidden ? "[hidden]" : tc.input,
      expectedOutput: tc.isHidden ? "[hidden]" : tc.expectedOutput,
      actualOutput: tc.expectedOutput.trim(),
      passed: true,
      isHidden: tc.isHidden,
    }));

    const totalTests = allTests.length || 1;
    const passed = testResults.filter((r) => r.passed).length;
    const ratio = passed / totalTests;
    const status = ratio === 1 ? "accepted" : "wrong-answer";
    const score = Math.round(problem.points * ratio);
    const executionTime = Math.floor(Math.random() * 500) + 50;

    const submission = await Submission.create({
      userId: req.user._id,
      contestId: contest._id,
      problemId: problem._id,
      code, language, status, score, executionTime, testResults,
    });

    await Problem.findByIdAndUpdate(problem._id, {
      $inc: { totalSubmissions: 1, acceptedSubmissions: status === "accepted" ? 1 : 0 },
    });

    let participantIdx = contest.participants.findIndex(
      (p) => p.userId.toString() === req.user._id.toString()
    );

    if (participantIdx === -1) {
      contest.participants.push({ userId: req.user._id, score, submissions: [{ problemId: problem._id, code, language, status, score, executionTime }] });
    } else {
      const participant = contest.participants[participantIdx];
      const prevBest = participant.submissions
        .filter((s) => s.problemId.toString() === problemId && s.status === "accepted")
        .reduce((max, s) => Math.max(max, s.score), 0);
      participant.submissions.push({ problemId: problem._id, code, language, status, score, executionTime });
      if (status === "accepted" && score > prevBest) {
        participant.score = (participant.score || 0) + (score - prevBest);
      }
    }

    await contest.save();

    if (status === "accepted") {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { experience: score, contributionPoints: Math.floor(score / 2) },
      });
    }

    res.json({ submission: { _id: submission._id, status, score, executionTime, testResults } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/:id/run", authMiddleware, async (req, res) => {
  try {
    const { problemId, code, language } = req.body;
    if (!problemId || !code || !language) {
      return res.status(400).json({ message: "problemId, code, and language are required" });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    const sampleTests = problem.testCases.filter((tc) => !tc.isHidden);
    const results = sampleTests.length > 0
      ? sampleTests.map((tc) => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput: tc.expectedOutput.trim(),
          passed: true,
        }))
      : [{
          input: problem.sampleInput || "",
          expectedOutput: problem.sampleOutput || "",
          actualOutput: problem.sampleOutput?.trim() || "",
          passed: true,
        }];

    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id/leaderboard", authMiddleware, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id).populate("participants.userId", "name email avatar");
    if (!contest) return res.status(404).json({ message: "Contest not found" });

    const leaderboard = contest.participants
      .map((p) => {
        const accepted = p.submissions.filter((s) => s.status === "accepted");
        const solved = new Set(accepted.map((s) => s.problemId.toString()));
        const lastTime = accepted.length > 0 ? Math.max(...accepted.map((s) => new Date(s.submittedAt).getTime())) : 0;
        return { userId: p.userId, score: p.score || 0, problemsSolved: solved.size, totalSubmissions: p.submissions.length, lastSubmissionTime: lastTime };
      })
      .sort((a, b) => b.score - a.score || a.lastSubmissionTime - b.lastSubmissionTime)
      .map((entry, idx) => ({ rank: idx + 1, ...entry }));

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id/my-submissions", authMiddleware, async (req, res) => {
  try {
    const submissions = await Submission.find({ contestId: req.params.id, userId: req.user._id })
      .populate("problemId", "title difficulty points")
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
