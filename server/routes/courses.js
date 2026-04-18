import express from "express";
import Course from "../models/Course.js";
import Activity from "../models/Activity.js";
import User from "../models/User.js";
import { authMiddleware, mentorOnlyMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("createdBy", "name email avatar")
      .populate("enrolledUsers", "name email avatar")
      .sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("createdBy", "name email avatar")
      .populate("enrolledUsers", "name email avatar");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ message: "Failed to fetch course" });
  }
});

router.post("/", authMiddleware, mentorOnlyMiddleware, async (req, res) => {
  try {
    const { title, description, difficulty, duration, price, thumbnail } = req.body;

    const course = new Course({
      title,
      description,
      createdBy: req.user._id,
      thumbnail:
        thumbnail ||
        "https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=400",
      difficulty: difficulty || "beginner",
      duration: parseInt(duration) || 1,
      price: parseFloat(price) || 0,
      chapters: [],
      enrolledUsers: [],
      rating: 0,
      reviews: [],
    });

    await course.save();
    await course.populate("createdBy", "name email avatar");

    const activity = new Activity({
      userId: req.user._id,
      type: "course_created",
      description: `Created course: ${title}`,
      points: 100,
      relatedId: course._id,
    });
    await activity.save();

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { experience: 100, contributionPoints: 100 },
    });

    res.status(201).json(course);
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ message: "Failed to create course" });
  }
});

router.post("/:id/enroll", authMiddleware, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const userId = req.user._id;
    const alreadyEnrolled = course.enrolledUsers.some(
      (id) => id.toString() === userId.toString()
    );

    if (!alreadyEnrolled) {
      course.enrolledUsers.push(userId);
      await course.save();
    }

    await course.populate("createdBy", "name email avatar");
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: "Failed to enroll in course" });
  }
});

router.delete("/:id", authMiddleware, mentorOnlyMiddleware, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this course" });
    }

    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ message: "Failed to delete course" });
  }
});

export default router;
