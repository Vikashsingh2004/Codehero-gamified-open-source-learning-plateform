import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "doubt_created",
        "doubt_solved",
        "session_hosted",
        "session_attended",
        "contest_participated",
        "course_created",
        "course_completed",
      ],
      required: true,
    },
    description: { type: String, required: true },
    points: { type: Number, required: true },
    relatedId: { type: mongoose.Schema.Types.ObjectId },
  },
  {
    timestamps: true,
  }
);

const Activity = mongoose.model("Activity", activitySchema);

export default Activity;
