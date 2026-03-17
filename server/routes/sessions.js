import express from "express";
import Session from "../models/Session.js";

const router = express.Router();

// GET all sessions
router.get("/", async (req, res) => {
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

// CREATE session
router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      mentorId,
      mentorName,
      scheduledAt,
      duration,
      capacity,
      tags,
    } = req.body;
    if (!title || !description || !mentorId || !scheduledAt)
      return res.status(400).json({ error: "Missing required fields" });

    const session = new Session({
      title,
      description,
      mentorId,
      mentorName,
      scheduledAt: new Date(scheduledAt),
      duration: Number(duration) || 60,
      capacity: Number(capacity) || 20,
      attendees: [mentorId],
      tags: tags || [],
      status: "upcoming",
    });

    await session.save();
    res.status(201).json({ ...session.toObject(), id: session._id.toString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create session" });
  }
});

// JOIN session
router.patch("/join/:id", async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ error: "Session not found" });

    const userId = req.body.userId || "1";

    if (!session.attendees.includes(userId)) {
      session.attendees.push(userId);
      await session.save();
    }

    res.json({ ...session.toObject(), id: session._id.toString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to join session" });
  }
});

export default router;
