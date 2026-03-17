import mongoose from "mongoose";

const solutionSchema = new mongoose.Schema({
  content: { type: String, required: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  upvotes: { type: Number, default: 0 },
  isAccepted: { type: Boolean, default: false },
});

const doubtSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    tags: [{ type: String }],
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "solved", "closed"],
      default: "open",
    },
    solutions: [solutionSchema],
    bounty: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const Doubt = mongoose.model("Doubt", doubtSchema);

export default Doubt;
