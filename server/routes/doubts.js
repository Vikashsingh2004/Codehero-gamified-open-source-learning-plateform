import express from "express";
import Doubt from "../models/Doubt.js";
import User from "../models/User.js";
import Activity from "../models/Activity.js";

const router = express.Router();

// Get all doubts
router.get("/", async (req, res) => {
  try {
    const doubts = await Doubt.find()
      .populate("createdBy", "name email avatar")
      .populate("solutions.createdBy", "name email avatar")
      .sort({ createdAt: -1 });
    res.json(doubts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new doubt
router.post("/", async (req, res) => {
  try {
    const { title, description, tags, difficulty, bounty } = req.body;

    // Get current user
    const user = await User.findOne({ email: "vikash@codehero.dev" });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const doubt = new Doubt({
      title,
      description,
      tags: tags.split(",").map((tag) => tag.trim()),
      difficulty,
      bounty: parseInt(bounty) || 0,
      createdBy: user._id,
    });

    await doubt.save();
    await doubt.populate("createdBy", "name email avatar");

    // Create activity
    const activity = new Activity({
      userId: user._id,
      type: "doubt_created",
      description: `Created a doubt: ${title}`,
      points: 10,
      relatedId: doubt._id,
    });
    await activity.save();

    // Update user experience
    user.experience += 10;
    user.contributionPoints += 10;
    await user.save();

    res.status(201).json(doubt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add solution to doubt
router.post("/:id/solutions", async (req, res) => {
  try {
    const { content } = req.body;
    const doubt = await Doubt.findById(req.params.id);

    if (!doubt) {
      return res.status(404).json({ message: "Doubt not found" });
    }

    const user = await User.findOne({ email: "vikash@codehero.dev" });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const solution = {
      content,
      createdBy: user._id,
      createdAt: new Date(),
      upvotes: 0,
      isAccepted: false,
    };

    doubt.solutions.push(solution);
    await doubt.save();
    await doubt.populate("solutions.createdBy", "name email avatar");

    // Create activity
    const activity = new Activity({
      userId: user._id,
      type: "doubt_solved",
      description: `Provided solution for: ${doubt.title}`,
      points: 25,
      relatedId: doubt._id,
    });
    await activity.save();

    // Update user experience
    user.experience += 25;
    user.contributionPoints += 25;
    await user.save();

    res.json(doubt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
