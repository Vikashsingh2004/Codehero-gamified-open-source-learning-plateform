import express from "express";
import Doubt from "../models/Doubt.js";
import User from "../models/User.js";
import Activity from "../models/Activity.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
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

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, tags, difficulty, bounty } = req.body;
    const user = req.user;

    const tagsArray = typeof tags === "string"
      ? tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      : Array.isArray(tags) ? tags : [];

    const doubt = new Doubt({
      title,
      description,
      tags: tagsArray,
      difficulty,
      bounty: parseInt(bounty) || 0,
      createdBy: user._id,
    });

    await doubt.save();
    await doubt.populate("createdBy", "name email avatar");

    const activity = new Activity({
      userId: user._id,
      type: "doubt_created",
      description: `Created a doubt: ${title}`,
      points: 10,
      relatedId: doubt._id,
    });
    await activity.save();

    await User.findByIdAndUpdate(user._id, {
      $inc: { experience: 10, contributionPoints: 10 },
    });

    res.status(201).json(doubt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/:id/solutions", authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    const doubt = await Doubt.findById(req.params.id);

    if (!doubt) {
      return res.status(404).json({ message: "Doubt not found" });
    }

    const user = req.user;

    const solution = {
      content,
      createdBy: user._id,
      createdAt: new Date(),
      upvotes: 0,
      isAccepted: false,
    };

    doubt.solutions.push(solution);
    await doubt.save();
    await doubt.populate("createdBy", "name email avatar");
    await doubt.populate("solutions.createdBy", "name email avatar");

    const activity = new Activity({
      userId: user._id,
      type: "doubt_solved",
      description: `Provided solution for: ${doubt.title}`,
      points: 25,
      relatedId: doubt._id,
    });
    await activity.save();

    await User.findByIdAndUpdate(user._id, {
      $inc: { experience: 25, contributionPoints: 25 },
    });

    res.json(doubt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
