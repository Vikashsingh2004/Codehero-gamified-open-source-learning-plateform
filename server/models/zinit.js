import mongoose from "mongoose";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Doubt from "../models/Doubt.js";
import Session from "../models/Session.js";
import Contest from "../models/Contest.js";
import Activity from "../models/Activity.js";

async function initializeData() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/Codehero");

    console.log("✅ Connected to MongoDB");

    // 1️⃣ Create a sample user
    const user = await User.create({
      name: "Vikash Singh",
      email: "vikash@codehero.dev",
      role: "mentor",
      badges: [
        {
          name: "First Contribution",
          description: "Provided the first solution",
          icon: "https://example.com/icons/first-contribution.png",
        },
      ],
    });
    console.log("✅ User created:", user._id);

    // 2️⃣ Create a sample Course
    const course = await Course.create({
      title: "Learn Node.js",
      description: "A full Node.js course",
      createdBy: user._id,
      difficulty: "beginner",
      duration: 10,
      price: 49,
      chapters: [
        {
          title: "Introduction",
          description: "Node.js Basics",
          videoUrl: "https://example.com/videos/intro.mp4",
          content: "Introduction content here...",
          order: 1,
          resources: [
            {
              title: "Intro PDF",
              type: "pdf",
              url: "https://example.com/intro.pdf",
            },
          ],
        },
      ],
      enrolledUsers: [user._id],
    });
    console.log("✅ Course created:", course._id);

    // 3️⃣ Create a sample Doubt
    const doubt = await Doubt.create({
      title: "How to use Express routing?",
      description: "I am confused about route parameters",
      tags: ["node", "express"],
      difficulty: "easy",
      createdBy: user._id,
      bounty: 100,
    });
    console.log("✅ Doubt created:", doubt._id);

    // 4️⃣ Create a sample Session
    const session = await Session.create({
      title: "Express.js Q&A",
      description: "Interactive Q&A about Express.js",
      mentorId: user._id,
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      duration: 90,
      capacity: 20,
      attendees: [user._id],
      tags: ["express", "node"],
      meetingLink: "https://zoom.us/j/1234567890",
    });
    console.log("✅ Session created:", session._id);

    // 5️⃣ Create a sample Contest
    const contest = await Contest.create({
      title: "Weekly Coding Challenge",
      description: "Solve algorithm problems",
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // In 2 hours
      endTime: new Date(Date.now() + 5 * 60 * 60 * 1000),
      difficulty: "intermediate",
      participants: [{ userId: user._id, score: 0, rank: 0 }],
      problems: [
        {
          title: "Sum Two Numbers",
          description: "Write a function to sum two numbers",
          difficulty: "easy",
          points: 50,
          testCases: [
            { input: "1 2", expectedOutput: "3" },
            { input: "10 20", expectedOutput: "30" },
          ],
        },
      ],
    });
    console.log("✅ Contest created:", contest._id);

    // 6️⃣ Create a sample Activity
    const activity = await Activity.create({
      userId: user._id,
      type: "session_attended",
      description: "Attended Express.js Q&A session",
      points: 20,
      relatedId: session._id,
    });
    console.log("✅ Activity created:", activity._id);

    console.log("🎉 All initial data created successfully!");
  } catch (err) {
    console.error("❌ Initialization error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

initializeData();
