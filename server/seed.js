import mongoose from "mongoose";
import dotenv from "dotenv";
import Contest from "./models/Contest.js";

dotenv.config();

const seedContests = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Clear existing contests
    await Contest.deleteMany({});

    const contests = [
      {
        title: "Weekly Coding Challenge",
        description: "Test your algorithmic skills with 4 challenging problems",
        startTime: new Date("2024-02-28T10:00:00"),
        endTime: new Date("2024-02-28T13:00:00"),
        difficulty: "intermediate",
        participants: [],
        problems: [
          {
            title: "Two Sum",
            description: "Find two numbers that add up to target",
            difficulty: "easy",
            points: 100,
            testCases: [
              { input: "[2,7,11,15], target=9", expectedOutput: "[0,1]" },
            ],
          },
          {
            title: "Binary Search",
            description: "Implement binary search algorithm",
            difficulty: "medium",
            points: 200,
            testCases: [
              { input: "[1,2,3,4,5], target=3", expectedOutput: "2" },
            ],
          },
        ],
        status: "upcoming",
      },
      {
        title: "Data Structures Sprint",
        description:
          "Advanced problems on trees, graphs, and dynamic programming",
        startTime: new Date("2024-03-05T15:00:00"),
        endTime: new Date("2024-03-05T18:00:00"),
        difficulty: "advanced",
        participants: [],
        problems: [
          {
            title: "Binary Tree Traversal",
            description: "Implement inorder traversal of binary tree",
            difficulty: "medium",
            points: 150,
            testCases: [{ input: "[1,null,2,3]", expectedOutput: "[1,3,2]" }],
          },
        ],
        status: "upcoming",
      },
    ];

    await Contest.insertMany(contests);
    console.log("✅ Contests seeded successfully");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding contests:", error);
    process.exit(1);
  }
};

seedContests();
