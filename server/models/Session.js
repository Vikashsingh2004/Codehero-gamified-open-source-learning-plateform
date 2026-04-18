import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    hostId: { type: String, required: true },
    hostName: { type: String, required: true },
    scheduledAt: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: { type: Number, required: true },
    capacity: { type: Number, required: true },
    attendees: [{ type: String }],
    tags: [{ type: String }],
    status: {
      type: String,
      enum: ["upcoming", "live", "expired"],
      default: "upcoming",
    },
  },
  { timestamps: true }
);

sessionSchema.methods.computeStatus = function () {
  const now = new Date();
  if (now < this.scheduledAt) return "upcoming";
  if (now >= this.scheduledAt && now <= this.endTime) return "live";
  return "expired";
};

const Session = mongoose.model("Session", sessionSchema);
export default Session;
