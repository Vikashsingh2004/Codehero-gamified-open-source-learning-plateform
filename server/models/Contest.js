import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
});

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
  },
  points: { type: Number, required: true },
  testCases: [testCaseSchema],
});

const submissionSchema = new mongoose.Schema({
  problemId: { type: mongoose.Schema.Types.ObjectId, required: true },
  code: { type: String, required: true },
  language: { type: String, required: true },
  status: {
    type: String,
    enum: ["accepted", "wrong-answer", "time-limit", "runtime-error"],
    required: true,
  },
  submittedAt: { type: Date, default: Date.now },
});

const participantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  score: { type: Number, default: 0 },
  submissions: [submissionSchema],
  rank: { type: Number, default: 0 },
});

const contestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },
    participants: [participantSchema],
    problems: [problemSchema],
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed"],
      default: "upcoming",
    },
  },
  {
    timestamps: true,
  }
);

const Contest = mongoose.model("Contest", contestSchema);

export default Contest;
