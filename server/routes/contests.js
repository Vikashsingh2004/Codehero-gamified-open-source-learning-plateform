import express from "express";
import Contest from "../models/Contest.js";
import User from "../models/User.js";
import Activity from "../models/Activity.js";

const router = express.Router();

// Get all contests
router.get("/", async (req, res) => {
  try {
    const contests = await Contest.find()
      .populate("participants.userId", "name email avatar")
      .sort({ startTime: -1 });
    res.json(contests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Join a contest
router.post("/:id/join", async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    const user = await User.findOne({ email: "vikash@codehero.dev" });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadyParticipating = contest.participants.some(
      (p) => p.userId.toString() === user._id.toString()
    );
    if (alreadyParticipating) {
      return res
        .status(400)
        .json({ message: "Already registered for this contest" });
    }

    contest.participants.push({
      userId: user._id,
      score: 0,
      submissions: [],
      rank: contest.participants.length + 1,
    });

    await contest.save();
    await contest.populate("participants.userId", "name email avatar");

    // Create activity
    const activity = new Activity({
      userId: user._id,
      type: "contest_participated",
      description: `Registered for contest: ${contest.title}`,
      points: 30,
      relatedId: contest._id,
    });
    await activity.save();

    // Update user experience
    user.experience += 30;
    user.contributionPoints += 30;
    await user.save();

    res.json(contest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
