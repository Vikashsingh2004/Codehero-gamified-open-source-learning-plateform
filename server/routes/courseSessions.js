import express from "express";
import CourseSession from "../models/CourseSession.js";
import Course from "../models/Course.js";
import Activity from "../models/Activity.js";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router({ mergeParams: true });

function enrichWithStatus(session) {
  const obj = session.toObject ? session.toObject() : { ...session };
  obj.id = obj._id?.toString() || obj.id;
  obj.status = session.computeStatus ? session.computeStatus() : computeStatus(obj);
  return obj;
}

function computeStatus(session) {
  const now = new Date();
  const start = new Date(session.scheduledAt);
  const end = new Date(session.endTime);
  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "live";
  return "expired";
}

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });

    const userId = req.user._id.toString();
    const isEnrolled = course.enrolledUsers.some((id) => id.toString() === userId);
    const isMentor = course.createdBy.toString() === userId;

    if (!isEnrolled && !isMentor) {
      return res.status(403).json({ error: "You are not enrolled in this course." });
    }

    const sessions = await CourseSession.find({ courseId }).sort({ scheduledAt: 1 });
    const formatted = sessions
      .map(enrichWithStatus)
      .filter((s) => s.status !== "expired");

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch course sessions" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });

    const userId = req.user._id.toString();
    if (course.createdBy.toString() !== userId) {
      return res.status(403).json({ error: "Only the course mentor can create sessions." });
    }

    const { title, description, scheduledAt, duration, capacity, tags } = req.body;

    if (!title || !description || !scheduledAt) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const durationMinutes = Number(duration) || 60;
    const startDate = new Date(scheduledAt);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

    const session = new CourseSession({
      courseId,
      title,
      description,
      hostId: userId,
      hostName: req.user.name,
      scheduledAt: startDate,
      endTime: endDate,
      duration: durationMinutes,
      capacity: Number(capacity) || 20,
      attendees: [userId],
      tags: tags || [],
      status: "upcoming",
    });

    await session.save();

    const activity = new Activity({
      userId: req.user._id,
      type: "session_hosted",
      description: `Hosted course session: ${title}`,
      points: 20,
      relatedId: session._id,
    });
    await activity.save();

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { experience: 20, contributionPoints: 20 },
    });

    res.status(201).json(enrichWithStatus(session));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create course session" });
  }
});

router.patch("/join/:sessionId", authMiddleware, async (req, res) => {
  try {
    const { courseId, sessionId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });

    const userId = req.user._id.toString();
    const isEnrolled = course.enrolledUsers.some((id) => id.toString() === userId);
    const isMentor = course.createdBy.toString() === userId;

    if (!isEnrolled && !isMentor) {
      return res.status(403).json({ message: "You are not enrolled in this course." });
    }

    const session = await CourseSession.findById(sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });

    const currentStatus = session.computeStatus();
    if (currentStatus !== "live") {
      return res.status(400).json({ message: "Session is not live yet or has already ended." });
    }

    if (!session.attendees.includes(userId)) {
      session.attendees.push(userId);
      await session.save();

      const activity = new Activity({
        userId: req.user._id,
        type: "session_attended",
        description: `Attended course session: ${session.title}`,
        points: 5,
        relatedId: session._id,
      });
      await activity.save();

      await User.findByIdAndUpdate(req.user._id, {
        $inc: { experience: 5, contributionPoints: 5 },
      });
    }

    res.json(enrichWithStatus(session));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to join session" });
  }
});

export default router;
