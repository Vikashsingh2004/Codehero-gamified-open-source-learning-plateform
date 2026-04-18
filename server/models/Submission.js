import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", required: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
    code: { type: String, required: true },
    language: { type: String, required: true },
    status: {
      type: String,
      enum: ["accepted", "wrong-answer", "time-limit", "runtime-error", "pending"],
      default: "pending",
    },
    score: { type: Number, default: 0 },
    executionTime: { type: Number, default: 0 },
    testResults: [
      {
        input: String,
        expectedOutput: String,
        actualOutput: String,
        passed: Boolean,
        isHidden: Boolean,
      },
    ],
  },
  { timestamps: true }
);

const Submission = mongoose.model("Submission", submissionSchema);
export default Submission;
