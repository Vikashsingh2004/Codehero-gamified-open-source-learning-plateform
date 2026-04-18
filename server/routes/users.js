import express from "express";
import User from "../models/User.js";
import { authMiddleware, mentorOnlyMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/me", authMiddleware, async (req, res) => {
  try {
    res.json(req.user.toPublicJSON());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/update-experience", authMiddleware, async (req, res) => {
  try {
    const { points } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.experience += points;
    user.contributionPoints += points;

    const newLevel = Math.floor(user.experience / 250) + 1;
    if (newLevel > user.level) {
      user.level = newLevel;
    }

    await user.save();
    res.json(user.toPublicJSON());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/all", authMiddleware, mentorOnlyMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ contributionPoints: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
