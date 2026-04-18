import express from "express";
import User from "../models/User.js";
import { generateToken, authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = new User({
      name,
      email,
      password,
      role: "user",
      level: 1,
      experience: 0,
      streak: 0,
      rating: 1200,
      contributionPoints: 0,
      badges: [],
    });

    await user.save();

    const token = generateToken(user._id.toString());

    res.status(201).json({
      token,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Failed to create account" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    user.lastActivity = new Date();
    await user.save();

    const token = generateToken(user._id.toString());

    res.json({
      token,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    res.json(req.user.toPublicJSON());
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

router.post("/logout", authMiddleware, async (req, res) => {
  res.json({ message: "Logged out successfully" });
});

router.put("/promote/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    targetUser.role = "mentor";
    await targetUser.save();

    res.json({ message: "User promoted to mentor", user: targetUser.toPublicJSON() });
  } catch (error) {
    res.status(500).json({ message: "Failed to promote user" });
  }
});

export default router;
