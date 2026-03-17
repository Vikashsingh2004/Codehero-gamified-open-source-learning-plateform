import express from "express";
import Course from "../models/Course.js";
import User from "../models/User.js";
import Activity from "../models/Activity.js";

const router = express.Router();

/* 🟢 Get all courses */
router.get("/", async (req, res) => {
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

/* 🟢 Get single course by ID */
router.get("/:id", async (req, res) => {
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

/* 🟢 Create a new course */
router.post("/", async (req, res) => {
  try {
    const { title, description, difficulty, duration, price, thumbnail } =
      req.body;

    // Simulated user (replace later with real authentication)
    const user = await User.findOne({ email: "vikash@codehero.dev" });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const course = new Course({
      title,
      description,
      createdBy: user._id,
      thumbnail:
        thumbnail ||
        "https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=400",
      difficulty,
      duration: parseInt(duration),
      price: parseFloat(price),
      chapters: [],
      enrolledUsers: [],
      rating: 0,
      reviews: [],
    });

    await course.save();
    await course.populate("createdBy", "name email avatar");

    // Log activity
    const activity = new Activity({
      userId: user._id,
      type: "course_created",
      description: `Created course: ${title}`,
      points: 100,
      relatedId: course._id,
    });
    await activity.save();

    // Update user XP
    user.experience += 100;
    user.contributionPoints += 100;
    await user.save();

    res.status(201).json(course);
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ message: "Failed to create course" });
  }
});

/* 🟢 Delete a course (auth disabled for testing) */
router.delete("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ message: "Failed to delete course" });
  }
});

export default router;
