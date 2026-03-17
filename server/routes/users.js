import express from "express";
import User from "../models/User.js";
//import Activity from "../models/Activity.js";

const router = express.Router();

// Get current user (mock for now)
router.get("/me", async (req, res) => {
  try {
    // For demo purposes, we'll create a default user if none exists
    let user = await User.findOne({ email: "vikash@codehero.dev" });

    if (!user) {
      user = new User({
        name: "vikash Singh",
        email: "vikash@codehero.dev",
        avatar:
          "https://res.cloudinary.com/dqzq0cjnr/image/upload/v1755711659/WhatsApp_Image_2025-04-29_at_18.04.51_eb6aea5b_elmq4o.jpg",
        role: "user",
        level: 5,
        experience: 1250,
        streak: 15,
        rating: 1350,
        contributionPoints: 2500,
        badges: [
          {
            name: "First Doubt",
            description: "Created your first doubt",
            icon: "❓",
            earnedAt: new Date("2024-01-15"),
          },
          {
            name: "Helper",
            description: "Solved 10 doubts",
            icon: "🤝",
            earnedAt: new Date("2024-01-20"),
          },
          {
            name: "Streak Master",
            description: "Maintained 7-day streak",
            icon: "🔥",
            earnedAt: new Date("2024-01-25"),
          },
        ],
      });
      await user.save();
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle user role
router.put("/toggle-role", async (req, res) => {
  try {
    const user = await User.findOne({ email: "vikash@codehero.dev" });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = user.role === "user" ? "mentor" : "user";
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user experience and level
router.put("/update-experience", async (req, res) => {
  try {
    const { points } = req.body;
    const user = await User.findOne({ email: "vikash@codehero.dev" });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.experience += points;
    user.contributionPoints += points;

    // Level up logic
    const newLevel = Math.floor(user.experience / 250) + 1;
    if (newLevel > user.level) {
      user.level = newLevel;
    }

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
