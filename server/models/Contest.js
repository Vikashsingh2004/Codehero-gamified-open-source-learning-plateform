import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  problemId: { type: mongoose.Schema.Types.ObjectId, required: true },
  code: { type: String, required: true },
  language: { type: String, required: true },
  status: {
    type: String,
    enum: ["accepted", "wrong-answer", "time-limit", "runtime-error", "pending"],
    default: "pending",
  },
  score: { type: Number, default: 0 },
  executionTime: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now },
});

const participantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  score: { type: Number, default: 0 },
  submissions: [submissionSchema],
  rank: { type: Number, default: 0 },
  joinedAt: { type: Date, default: Date.now },
  hasEntered: { type: Boolean, default: false },
  enteredAt: { type: Date },
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
    totalMarks: { type: Number, default: 0 },
    problems: [{ type: mongoose.Schema.Types.ObjectId, ref: "Problem" }],
    participants: [participantSchema],
    status: {
      type: String,
      enum: ["upcoming", "live", "ended"],
      default: "upcoming",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

contestSchema.methods.computeStatus = function () {
  const now = new Date();
  if (now < this.startTime) return "upcoming";
  if (now >= this.startTime && now <= this.endTime) return "live";
  return "ended";
};

const Contest = mongoose.model("Contest", contestSchema);
export default Contest;
