import express from "express";
import Activity from "../models/Activity.js";
import User from "../models/User.js";

const router = express.Router();

// Get user activities
router.get("/", async (req, res) => {
  try {
    const user = await User.findOne({ email: "vikash@codehero.dev" });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const activities = await Activity.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
