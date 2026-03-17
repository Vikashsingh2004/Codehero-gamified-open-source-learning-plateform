import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    mentorId: { type: String, required: true }, // string for testing
    mentorName: { type: String, required: true },
    scheduledAt: { type: Date, required: true },
    duration: { type: Number, required: true },
    capacity: { type: Number, required: true },
    attendees: [{ type: String }], // string IDs for simplicity
    tags: [{ type: String }],
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
  },
  { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);
export default Session;
