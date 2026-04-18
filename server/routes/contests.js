import express from "express";
import Contest from "../models/Contest.js";
import User from "../models/User.js";
import Activity from "../models/Activity.js";
import { authMiddleware, mentorOnlyMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const contests = await Contest.find()
      .populate("participants.userId", "name email avatar")
      .sort({ startTime: -1 });
    res.json(contests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id).populate(
      "participants.userId",
      "name email avatar"
    );
    if (!contest) return res.status(404).json({ message: "Contest not found" });
    res.json(contest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", authMiddleware, mentorOnlyMiddleware, async (req, res) => {
  try {
    const { title, description, startTime, endTime, difficulty } = req.body;

    if (!title || !description || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const contest = new Contest({
      title,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      difficulty: difficulty || "intermediate",
      participants: [],
      problems: [],
      status: "upcoming",
    });

    await contest.save();

    const activity = new Activity({
      userId: req.user._id,
      type: "contest_participated",
      description: `Created contest: ${title}`,
      points: 50,
      relatedId: contest._id,
    });
    await activity.save();

    res.status(201).json(contest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/:id/join", authMiddleware, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    const user = req.user;

    const alreadyParticipating = contest.participants.some(
      (p) => p.userId.toString() === user._id.toString()
    );
    if (alreadyParticipating) {
      return res.status(400).json({ message: "Already registered for this contest" });
    }

    contest.participants.push({
      userId: user._id,
      score: 0,
      submissions: [],
      rank: contest.participants.length + 1,
    });

    await contest.save();
    await contest.populate("participants.userId", "name email avatar");

    const activity = new Activity({
      userId: user._id,
      type: "contest_participated",
      description: `Registered for contest: ${contest.title}`,
      points: 30,
      relatedId: contest._id,
    });
    await activity.save();

    await User.findByIdAndUpdate(user._id, {
      $inc: { experience: 30, contributionPoints: 30 },
    });

    res.json(contest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id/leaderboard", authMiddleware, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id).populate(
      "participants.userId",
      "name email avatar"
    );
    if (!contest) return res.status(404).json({ message: "Contest not found" });

    const leaderboard = contest.participants
      .sort((a, b) => b.score - a.score)
      .map((p, index) => ({
        rank: index + 1,
        user: p.userId,
        score: p.score,
        problemsSolved: p.submissions.filter((s) => s.status === "accepted").length,
        totalSubmissions: p.submissions.length,
      }));

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
