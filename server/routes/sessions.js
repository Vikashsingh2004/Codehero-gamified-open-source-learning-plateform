import express from "express";
import Session from "../models/Session.js";
import Activity from "../models/Activity.js";
import { authMiddleware, mentorOnlyMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const sessions = await Session.find().sort({ scheduledAt: 1 });
    const formatted = sessions.map((s) => ({
      ...s.toObject(),
      id: s._id.toString(),
    }));
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

router.post("/", authMiddleware, mentorOnlyMiddleware, async (req, res) => {
  try {
    const { title, description, scheduledAt, duration, capacity, tags } = req.body;

    if (!title || !description || !scheduledAt) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const session = new Session({
      title,
      description,
      mentorId: req.user._id.toString(),
      mentorName: req.user.name,
      scheduledAt: new Date(scheduledAt),
      duration: Number(duration) || 60,
      capacity: Number(capacity) || 20,
      attendees: [req.user._id.toString()],
      tags: tags || [],
      status: "upcoming",
    });

    await session.save();

    const activity = new Activity({
      userId: req.user._id,
      type: "session_hosted",
      description: `Hosted session: ${title}`,
      points: 50,
      relatedId: session._id,
    });
    await activity.save();

    res.status(201).json({ ...session.toObject(), id: session._id.toString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create session" });
  }
});

router.patch("/join/:id", authMiddleware, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ error: "Session not found" });

    const userId = req.user._id.toString();

    if (!session.attendees.includes(userId)) {
      session.attendees.push(userId);
      await session.save();

      const activity = new Activity({
        userId: req.user._id,
        type: "session_attended",
        description: `Joined session: ${session.title}`,
        points: 20,
        relatedId: session._id,
      });
      await activity.save();
    }

    res.json({ ...session.toObject(), id: session._id.toString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to join session" });
  }
});

export default router;
